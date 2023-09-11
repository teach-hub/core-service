import {
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { buildInvite } from './inviteService';
import { fromGlobalId, toGlobalId } from '../../graphql/utils';

import InviteModel from './model';
import { createUserRole } from '../userRole/userRoleService';

import { AuthenticatedContext } from '../../context';

// El context es autenticado por GraphQLShield.

export const inviteMutations: GraphQLFieldConfigMap<null, AuthenticatedContext> = {
  generateInviteCode: {
    type: new GraphQLNonNull(GraphQLString),
    description: 'Generates an invitation code',
    args: {
      roleId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      expirationMinutes: {
        type: GraphQLInt,
      },
    },

    resolve: async (_, args, context) => {
      const {
        roleId: encodedRoleId,
        courseId: encodedCourseId,
        expirationMinutes,
      } = args;

      const { dbId: roleId } = fromGlobalId(encodedRoleId);
      const { dbId: courseId } = fromGlobalId(encodedCourseId);

      context.logger.info('Building invite for', { roleId, courseId });

      const invite = await buildInvite({ roleId, courseId, expirationMinutes });

      return toGlobalId({ dbId: String(invite.id), entityName: 'invite' });
    },
  },
  useInvite: {
    type: new GraphQLObjectType({
      name: 'UseInviteResponse',
      fields: {
        courseId: { type: GraphQLID },
      },
    }), // Set nullable to avoid 500 error if error raises
    description:
      'Use an invite to enter to be added to a course and return the course id',
    args: {
      inviteId: { type: new GraphQLNonNull(GraphQLID) },
    },

    resolve: async (_, args, context) => {
      const { inviteId: encodedInviteId } = args;
      const { dbId: inviteId } = fromGlobalId(encodedInviteId);

      context.logger.info('Using invite', { inviteId });

      const invite = await InviteModel.findOne({ where: { id: Number(inviteId) } });

      if (!invite) {
        throw new Error('Invite not found');
      }

      const currentDate = new Date();
      if (invite.expiresAt && currentDate > invite.expiresAt) {
        throw new Error('Invite expired');
      }

      context.logger.info(
        `Creating user role ${invite.roleId} for user ${context.viewerUserId} in course ${invite.courseId}`
      );

      const userRole = await createUserRole({
        userId: context.viewerUserId,
        roleId: invite.roleId,
        courseId: invite.courseId,
        active: true,
      });

      return {
        courseId: toGlobalId({ dbId: String(userRole.courseId), entityName: 'course' }),
      };
    },
  },
};
