import { GraphQLNonNull, GraphQLString } from 'graphql';

import { buildInvite, markInviteAsUsed } from './inviteService';
import { toGlobalId, fromGlobalId } from '../../graphql/utils';

import { getViewer } from '../user/internalGraphql';

import type { Context } from 'src/types';

export const inviteMutations = {
  generateInviteCode: {
    name: 'GenerateInvitationCode',
    type: new GraphQLNonNull(GraphQLString),
    description: 'Generates an invitation code',
    args: {
      roleId: {
        type: new GraphQLNonNull(GraphQLString),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve: async (_: unknown, args: any, context: Context) => {
      const { roleId: encodedRoleId, courseId: encodedCourseId } = args;

      const { dbId: roleId } = fromGlobalId(encodedRoleId);
      const { dbId: courseId } = fromGlobalId(encodedCourseId);

      context.logger.info('Building invite for', { roleId, courseId });

      const invite = await buildInvite({ roleId, courseId });

      // @ts-expect-error
      const code = toGlobalId({ dbId: invite.id, entityName: 'invite' });

      return code;
    },
  },
  useInvite: {
    name: 'UseInvite',
    type: new GraphQLNonNull(GraphQLString),
    description: 'Marks an invite as used returning the course',
    args: {
      inviteId: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve: async (_: any, args: any, context: Context) => {
      const { inviteId: encodedInviteId } = args;
      const { dbId: inviteId } = fromGlobalId(encodedInviteId);

      const viewer = await getViewer(context);

      context.logger.info('Marking invite as used', { inviteId });

      await markInviteAsUsed({ inviteId, viewer });
    },
  },
};
