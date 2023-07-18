import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { getGroupFields } from './graphql';
import { toGlobalId } from '../../graphql/utils';
import { AssignmentFields, findAllAssignments } from '../assignment/assignmentService';
import {
  findAllGroupParticipants,
  GroupParticipantFields,
} from '../groupParticipant/service';

import { UserType } from '../user/internalGraphql';
import { findAllUsers, UserFields } from '../user/userService';
import { findAllUserRoles } from '../userRole/userRoleService';

export const InternalGroupUsersByAssignments = new GraphQLObjectType({
  name: 'InternalGroupUsersByAssignments',
  description: 'Users withing a group by assignments',
  fields: {
    assignmentIds: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLID)),
      resolve: x =>
        x.assignmentIds.map((id: string) =>
          toGlobalId({
            entityName: 'assignment',
            dbId: String(id),
          })
        ),
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
        // Find every assignment for the course of the group
        const assignments = await findAllAssignments({
          forCourseId: group.courseId,
        });

        // Find all participants from the group, independent of the assignment
        const groupParticipants = await findAllGroupParticipants({
          forGroupId: group.id,
        });

        const assignmentsWithMatchingParticipantsArray: AssignmentsWithMatchingParticipants[] =
          joinAssignmentsWithMatchingParticipants({
            assignments,
            groupParticipants,
          });

        // Find user roles for every participant, and then the users for each of them
        const userRoles = await findAllUserRoles({
          id: groupParticipants
            .map(groupParticipant => groupParticipant.userRoleId)
            .filter(id => id) as number[],
        });

        const users = await findAllUsers({
          id: userRoles.map(userRole => userRole.userId).filter(id => id) as number[],
        });

        assignmentsWithMatchingParticipantsArray.forEach(
          assignmentsWithMatchingParticipants => {
            // Search for user roles of the participants
            const userRolesFiltered = userRoles.filter(user => {
              return assignmentsWithMatchingParticipants.participants.some(
                participant => {
                  return participant.userRoleId === user.id;
                }
              );
            });

            // Add the user data related to the participants from the assignments
            assignmentsWithMatchingParticipants.users = users.filter(user => {
              return userRolesFiltered.some(userRole => {
                return userRole.userId === user.id;
              });
            });
          }
        );

        return assignmentsWithMatchingParticipantsArray;
      },
    },
    // participants: {
    //   type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(InternalGroupParticipantType))),
    //   resolve: async group => {
    //     const participants = await findAllGroupParticipants({ forGroupId: group.id });
    //     return participants;
    //   }
    // }
  },
});

/**
 * Contains in a same object the assignments that share
 * the same participants, and the user data related to them
 * */
interface AssignmentsWithMatchingParticipants {
  assignmentIds: number[];
  participants: GroupParticipantFields[];
  users: UserFields[];
}

// Interface to group participants by assignment id
interface GroupParticipantsByAssignment {
  [key: number]: GroupParticipantFields[];
}

const joinAssignmentsWithMatchingParticipants = ({
  groupParticipants,
  assignments,
}: {
  groupParticipants: GroupParticipantFields[];
  assignments: AssignmentFields[];
}) => {
  const groupParticipantsByAssignment =
    buildGroupParticipantsByAssignment(groupParticipants);
  return Object.values(groupParticipantsByAssignment).reduce(
    (
      result: AssignmentsWithMatchingParticipants[],
      participants: GroupParticipantFields[]
    ) => {
      const currentAssignmentId = participants[0].assignmentId;

      const existingResult = result.find(grouped => {
        const groupedIds = grouped.participants.map(p => p.userRoleId);
        return participants.every(p => groupedIds.includes(p.userRoleId));
      });

      const assignment = assignments.find(
        assignment => assignment.id === currentAssignmentId
      );

      if (assignment?.id) {
        if (existingResult) {
          existingResult.assignmentIds.push(assignment.id);
        } else {
          result.push({
            assignmentIds: [assignment.id],
            participants: participants,
            users: [],
          });
        }
      }

      return result;
    },
    []
  );
};

const buildGroupParticipantsByAssignment = (
  groupParticipants: GroupParticipantFields[]
): GroupParticipantsByAssignment => {
  return groupParticipants.reduce(
    (acc: GroupParticipantsByAssignment, groupParticipant: GroupParticipantFields) => {
      if (groupParticipant.assignmentId) {
        // If assigment already in result, add participant to the list
        if (!acc[groupParticipant.assignmentId]) {
          acc[groupParticipant.assignmentId] = [];
        }
        acc[groupParticipant.assignmentId].push(groupParticipant);
      }

      return acc;
    },
    {}
  );
};
