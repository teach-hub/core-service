import {
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';

import { getGroupParticipantFields } from './graphql';
import { createGroupWithParticipants, findAllGroups, findGroup } from '../group/service';
import {
  createGroupParticipant,
  updateGroupParticipant,
  findAllGroupParticipants,
} from './service';
import { getViewer, UserType } from '../user/internalGraphql';
import { findUserRole, findUserRoleInCourse } from '../userRole/userRoleService';
import { InternalGroupType } from '../group/internalGraphql';
import { findUser } from '../user/userService';
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

        return findUser({ userId: participantUserRole.userId });
      },
    },
    group: {
      type: new GraphQLNonNull(InternalGroupType),
      resolve: async groupParticipant => {
        return findGroup({ groupId: groupParticipant.groupId });
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

      const userRole = await findUserRoleInCourse({
        courseId,
        userId: viewer.id,
      });

      context.logger.info(
        `Creating group with name ${groupName} for assignment ${assignmentId} for user ${viewer.id}`
      );

      const createdGroup = await createGroupWithParticipants({
        courseId,
        assignmentId,
        membersUserRoleIds: [userRole.id],
      });

      const [participant] = await findAllGroupParticipants({
        forGroupId: createdGroup.id,
      });
      return participant;
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
      if (!context.viewerUserId) {
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
        userId: context.viewerUserId,
      });

      context.logger.info(
        `Joining group ${groupId} for assignment ${assignmentId} for user ${context.viewerUserId}`
      );

      const assignmentGroups = await findAllGroups({ forAssignmentId: assignmentId });

      const userAssignmentGroupParticipants = await findAllGroupParticipants({
        forUserRoleId: userRole.id,
        forGroupIds: assignmentGroups.map(g => g.id),
      });

      if (!userAssignmentGroupParticipants.length) {
        context.logger.info('Creating group participant for user', { userRole, groupId });

        // User has no group participant. Let's create one.
        return createGroupParticipant({
          groupId,
          userRoleId: userRole.id,
          active: true,
        });
      }

      if (userAssignmentGroupParticipants.length > 1) {
        throw new Error('User has more than group in assignment');
      }

      const [currentGroupParticipant] = userAssignmentGroupParticipants;

      context.logger.info('Updating group participant for user', { userRole, groupId });

      return updateGroupParticipant(currentGroupParticipant.id, {
        groupId,
        userRoleId: userRole.id,
        active: true,
      });
    },
  },
};

const validateGroupOnJoin = async ({ assignmentId }: { assignmentId: number }) => {
  const assignment = await findAssignment({ assignmentId });
  if (!assignment?.isGroup) {
    throw new Error('Assignment is not a group assignment');
  }
};
