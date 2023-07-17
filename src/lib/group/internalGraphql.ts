import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { getGroupFields } from './graphql';
import { toGlobalId } from '../../graphql/utils';
import { AssignmentFields, findAllAssignments } from '../assignment/assignmentService';
import {
  findAllGroupParticipants,
  GroupParticipantFields,
} from '../groupParticipant/service';
import { UserType } from '../user/internalGraphql';
import { AssignmentType } from '../assignment/graphql';
import { findAllUsers, UserFields } from '../user/userService';
import { findAllUserRoles } from '../userRole/userRoleService';

const InternalGroupUsersByAssignments = new GraphQLObjectType({
  name: 'InternalGroupUsersByAssignments',
  description: 'Users withing a group by assignments',
  fields: {
    assignments: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AssignmentType))),
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
    },
  },
});

export const InternalGroupType = new GraphQLObjectType({
  name: 'InternalGroupType',
  description: 'A group within TeachHub',
  fields: {
    ...getGroupFields({ addId: false }),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'group',
          dbId: String(s.id),
        }),
    },
    courseId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'course',
          dbId: String(s.courseId),
        }),
    },
    usersByAssignments: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(InternalGroupUsersByAssignments))
      ),
      description: 'Users withing a group by assignments',
      resolve: async (group, _, __) => {
        const assignments = await findAllAssignments({
          forCourseId: group.courseId,
        });

        const groupParticipants = await findAllGroupParticipants({
          forGroupId: group.id,
        });

        interface GroupParticipantsByAssignment {
          [key: number]: GroupParticipantFields[];
        }

        const groupParticipantsByAssignment: GroupParticipantsByAssignment =
          groupParticipants.reduce(
            (
              grouped: GroupParticipantsByAssignment,
              groupParticipant: GroupParticipantFields
            ) => {
              if (groupParticipant.assignmentId) {
                if (!grouped[groupParticipant.assignmentId]) {
                  grouped[groupParticipant.assignmentId] = [];
                }
                grouped[groupParticipant.assignmentId].push(groupParticipant);
              }

              return grouped;
            },
            {}
          );

        interface Result {
          assignments: AssignmentFields[];
          participants: GroupParticipantFields[];
          users: UserFields[];
        }

        const groupedParticipants: Result[] = Object.values(
          groupParticipantsByAssignment
        ).reduce((result: Result[], participants: GroupParticipantFields[]) => {
          const currentAssignmentId = participants[0].assignmentId;

          const existingResult = result.find(grouped => {
            const groupedIds = grouped.participants.map(p => p.userRoleId);
            return participants.every(p => groupedIds.includes(p.userRoleId));
          });

          const assignment = assignments.find(
            assignment => assignment.id === currentAssignmentId
          );

          if (assignment) {
            if (existingResult) {
              existingResult.assignments.push(assignment);
            } else {
              result.push({
                assignments: [assignment],
                participants: participants,
                users: [],
              });
            }
          }

          return result;
        }, []);

        const userRoles = await findAllUserRoles({
          id: groupParticipants
            .map(groupParticipant => groupParticipant.userRoleId)
            .filter(id => id) as number[],
        });

        const users = await findAllUsers({
          id: userRoles.map(userRole => userRole.userId).filter(id => id) as number[],
        });

        groupedParticipants.forEach(grouped => {
          const userRolesFiltered = userRoles.filter(user => {
            return grouped.participants.some(participant => {
              return participant.userRoleId === user.id;
            });
          });
          grouped.users = users.filter(user => {
            return userRolesFiltered.some(userRole => {
              return userRole.userId === user.id;
            });
          });
        });

        return groupedParticipants;
      },
    },
  },
});
