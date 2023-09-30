import {
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';

import { getGroupParticipantFields } from './graphql';
import { createGroup, findAllGroups, findGroup } from '../group/service';
import {
  createGroupParticipant,
  updateGroupParticipant,
  findAllGroupParticipants,
} from './service';
import { getViewer, UserType } from '../user/internalGraphql';
import {
  findAllUserRoles,
  findUserRole,
  findUserRoleInCourse,
} from '../userRole/userRoleService';
import { InternalGroupType } from '../group/internalGraphql';
import { findAllUsers, findUser } from '../user/userService';
import { findAssignment } from '../assignment/assignmentService';

import type { AuthenticatedContext } from 'src/context';

export const InternalGroupParticipantType = new GraphQLObjectType({
  name: 'InternalGroupParticipantType',
  description: 'A group participant within TeachHub',
  fields: {
    ...getGroupParticipantFields({ addId: true }),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'groupParticipant',
          dbId: s.id,
        }),
    },
    userRoleId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'userRole',
          dbId: s.userRoleId,
        }),
    },
    user: {
      type: new GraphQLNonNull(UserType),
      resolve: async participant => {
        const participantUserRole = await findUserRole({ id: participant.userRoleId });

        if (!participantUserRole) {
          throw new Error('User role not found');
        }

        return await findUser({ userId: participantUserRole.userId });
      },
    },
    groupId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'group',
          dbId: s.groupId,
        }),
    },
    group: {
      type: new GraphQLNonNull(InternalGroupType),
      resolve: async groupParticipant => {
        return findGroup({ groupId: groupParticipant.groupId });
      },
    },
    groupUsers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async groupParticipant => {
        const groupParticipants = await findAllGroupParticipants({
          forGroupId: groupParticipant.groupId,
        });

        const userRoles = await findAllUserRoles({
          id: groupParticipants.map(gp => gp.userRoleId) as number[],
        });

        return findAllUsers({
          id: userRoles.map(ur => ur.userId) as number[],
        });
      },
    },
  },
});

export const groupParticipantMutations: GraphQLFieldConfigMap<
  null,
  AuthenticatedContext
> = {
  createGroupWithParticipant: {
    type: new GraphQLNonNull(InternalGroupParticipantType),
    description: 'Creates a group and adds a participant to it',
    args: {
      groupName: {
        type: new GraphQLNonNull(GraphQLString),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      assignmentId: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve: async (_, args, context) => {
      const viewer = await getViewer(context);

      if (!viewer?.id) {
        throw new Error('User not authenticated');
      }

      const {
        assignmentId: encodedAssignmentId,
        courseId: encodedCourseId,
        groupName,
      } = args;

      const assignmentId = fromGlobalIdAsNumber(encodedAssignmentId);
      const courseId = fromGlobalIdAsNumber(encodedCourseId);

      await validateGroupOnCreation({ groupName, courseId, assignmentId });

      const userRole = await findUserRoleInCourse({
        courseId,
        userId: viewer.id,
      });

      context.logger.info(
        `Creating group with name ${groupName} for assignment ${assignmentId} for user ${viewer.id}`
      );

      const group = await createGroup({
        name: groupName,
        courseId,
        assignmentId,
      });

      if (!group) {
        throw new Error('Group could not be created');
      }

      const assignmentGroups = await findAllGroups({ forAssignmentId: assignmentId });

      const userGroupParticipants = await findAllGroupParticipants({
        forUserRoleId: userRole.id,
        forGroupIds: assignmentGroups.map(g => g.id),
      });

      context.logger.info('Current user group participants', { userGroupParticipants });

      if (userGroupParticipants.length > 1) {
        throw new Error('User has more than group in assignment');
      }

      const [currentGroupParticipant] = userGroupParticipants;

      return updateGroupParticipant(currentGroupParticipant.id, {
        groupId: group.id,
        userRoleId: userRole.id,
        active: true,
      });
    },
  },
  joinGroup: {
    type: new GraphQLNonNull(InternalGroupParticipantType),
    description: 'Joins viewer to a group',
    args: {
      groupId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      assignmentId: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve: async (_, args, context) => {
      const viewer = await getViewer(context);

      if (!viewer) {
        throw new Error('User not authenticated');
      }

      const {
        assignmentId: encodedAssignmentId,
        groupId: encodedGroupId,
        courseId: encodedCourseId,
      } = args;

      const assignmentId = fromGlobalIdAsNumber(encodedAssignmentId);
      const groupId = fromGlobalIdAsNumber(encodedGroupId);
      const courseId = fromGlobalIdAsNumber(encodedCourseId);

      await validateGroupOnJoin({ assignmentId });

      const userRole = await findUserRoleInCourse({
        courseId,
        userId: viewer.id,
      });

      context.logger.info(
        `Joining group ${groupId} for assignment ${assignmentId} for user ${viewer.id}`
      );

      return await createGroupParticipant({
        groupId,
        userRoleId: userRole.id,
        active: true,
      });
    },
  },
  createGroupWithParticipants: {
    type: new GraphQLNonNull(new GraphQLList(InternalGroupParticipantType)),
    description: 'Creates a group and adds a list of participants to it',
    args: {
      groupName: {
        type: new GraphQLNonNull(GraphQLString),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      assignmentId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      participantUserRoleIds: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      },
    },
    resolve: async (_, args, context) => {
      const {
        assignmentId: encodedAssignmentId,
        courseId: encodedCourseId,
        groupName,
        participantUserRoleIds: encodedParticipantUserRoleIds,
      } = args;

      const assignmentId = fromGlobalIdAsNumber(encodedAssignmentId);
      const courseId = fromGlobalIdAsNumber(encodedCourseId);
      const participantUserRoleIds: number[] =
        encodedParticipantUserRoleIds.map(fromGlobalIdAsNumber);

      await validateGroupOnCreation({ groupName, courseId, assignmentId });

      const logText = `Creating group with name ${groupName} for assignment ${assignmentId} for user with roles ${participantUserRoleIds.join(
        ', '
      )}`;

      context.logger.info(logText);

      const group = await createGroup({
        name: groupName,
        courseId,
        assignmentId,
      });

      if (!group) {
        throw new Error('Group could not be created');
      }

      return await Promise.all(
        participantUserRoleIds.map(async userRoleId =>
          createGroupParticipant({
            groupId: group.id,
            userRoleId: userRoleId,
            active: true,
          })
        )
      );
    },
  },
  addParticipantsToGroup: {
    type: new GraphQLNonNull(new GraphQLList(InternalGroupParticipantType)),
    description: 'Adds a list of participants to a group',
    args: {
      groupId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      assignmentId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      participantUserRoleIds: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      },
    },
    resolve: async (_, args, context) => {
      const {
        assignmentId: encodedAssignmentId,
        groupId: encodedGroupId,
        participantUserRoleIds: encodedParticipantUserRoleIds,
      } = args;

      const assignmentId = fromGlobalIdAsNumber(encodedAssignmentId);
      const groupId = fromGlobalIdAsNumber(encodedGroupId);
      const participantUserRoleIds: number[] =
        encodedParticipantUserRoleIds.map(fromGlobalIdAsNumber);

      await validateGroupOnJoin({ assignmentId });

      context.logger.info(
        `Adding users with roles ${participantUserRoleIds.join(
          ', '
        )} to group ${groupId} for assignment ${assignmentId}`
      );

      return await Promise.all(
        participantUserRoleIds.map(async userRoleId =>
          createGroupParticipant({
            groupId,
            userRoleId,
            active: true,
          })
        )
      );
    },
  },
};

const validateGroupOnCreation = async ({
  groupName,
  courseId,
  assignmentId,
}: {
  groupName: string;
  courseId: number;
  assignmentId: number;
}) => {
  /* Group name must be available in course */
  const existingGroup = await findAllGroups({
    name: groupName,
    forCourseId: courseId,
  });

  if (existingGroup.length > 0) {
    throw new Error('Group name not available');
  }

  const assignment = await findAssignment({ assignmentId });
  if (assignment?.isGroup !== true) {
    throw new Error('Assignment is not a group assignment');
  }
};

const validateGroupOnJoin = async ({ assignmentId }: { assignmentId: number }) => {
  const assignment = await findAssignment({ assignmentId });
  if (assignment?.isGroup !== true) {
    throw new Error('Assignment is not a group assignment');
  }
};
