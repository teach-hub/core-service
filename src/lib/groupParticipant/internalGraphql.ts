import {
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';

import type { Context } from 'src/types';
import { getGroupParticipantFields } from './graphql';
import { createGroup, findAllGroups, findGroup } from '../group/service';
import { createGroupParticipant, findAllGroupParticipants } from './service';
import { getViewer, UserType } from '../user/internalGraphql';
import { findAllUserRoles, findUserRoleInCourse } from '../userRole/userRoleService';
import { InternalGroupType } from '../group/internalGraphql';
import { findAllUsers } from '../user/userService';

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
          dbId: String(s.id),
        }),
    },
    assignmentId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'assignment',
          dbId: String(s.assignmentId),
        }),
    },
    userRoleId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'userRole',
          dbId: String(s.userRoleId),
        }),
    },
    groupId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'group',
          dbId: String(s.groupId),
        }),
    },
    group: {
      type: new GraphQLNonNull(InternalGroupType),
      resolve: async groupParticipant => {
        return await findGroup({ groupId: groupParticipant.groupId });
      },
    },
    otherParticipants: {
      type: new GraphQLNonNull(GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async groupParticipant => {
        const groupParticipants = await findAllGroupParticipants({
          forGroupId: groupParticipant.groupId,
          forAssignmentId: groupParticipant.assignmentId,
        });

        const userRoles = await findAllUserRoles({
          id: groupParticipants.map(gp => gp.userRoleId) as number[],
        });

        return await findAllUsers({
          id: userRoles.map(ur => ur.userId) as number[],
        });
      },
    },
  },
});

export const groupParticipantMutations: GraphQLFieldConfigMap<null, Context> = {
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

      const {
        assignmentId: encodedAssignmentId,
        courseId: encodedCourseId,
        groupName,
      } = args;

      const assignmentId = fromGlobalIdAsNumber(encodedAssignmentId);
      const courseId = fromGlobalIdAsNumber(encodedCourseId);

      await validateGroupOnCreation({ groupName, courseId });

      const userRole = await findUserRoleInCourse({
        courseId,
        userId: Number(viewer.id),
      });

      context.logger.info(
        `Creating group with name ${groupName} for assignment ${assignmentId} for user ${viewer.id}`
      );

      const group = await createGroup({
        name: groupName,
        courseId,
        id: undefined,
        active: true,
      });

      return await createGroupParticipant({
        id: undefined,
        assignmentId: assignmentId,
        groupId: group.id,
        userRoleId: userRole.id,
        active: true,
      });
    },
  },
};

const validateGroupOnCreation = async ({
  groupName,
  courseId,
}: {
  groupName: string;
  courseId: number;
}) => {
  /* Group name must be available in course */
  const existingGroup = await findAllGroups({
    name: groupName,
    forCourseId: courseId,
  });

  if (existingGroup.length > 0) {
    throw new Error('Group name not available');
  }
};
