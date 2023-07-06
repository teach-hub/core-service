import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

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
        type: new GraphQLNonNull(GraphQLID),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },

    // FIXME. No copiar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve: async (_: unknown, args: any, context: Context) => {
      const { roleId: encodedRoleId, courseId: encodedCourseId } = args;

      const { dbId: roleId } = fromGlobalId(encodedRoleId);
      const { dbId: courseId } = fromGlobalId(encodedCourseId);

      context.logger.info('Building invite for', { roleId, courseId });

      const invite = await buildInvite({ roleId, courseId });

      return toGlobalId({ dbId: String(invite.id), entityName: 'invite' });
    },
  },
  useInvite: {
    name: 'UseInvite',
    type: new GraphQLNonNull(
      new GraphQLObjectType({
        name: 'UseInviteResponse',
        fields: {
          courseId: { type: GraphQLID },
        },
      })
    ),
    description: 'Marks an invite as used returning the course id',
    args: {
      inviteId: { type: new GraphQLNonNull(GraphQLID) },
    },

    // FIXME. No copiar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve: async (_: any, args: any, context: Context) => {
      const { inviteId: encodedInviteId } = args;
      const { dbId: inviteId } = fromGlobalId(encodedInviteId);

      const viewer = await getViewer(context);

      context.logger.info('Marking invite as used', { inviteId });

      const userRole = await markInviteAsUsed({ inviteId, viewer });

      return {
        courseId: toGlobalId({ dbId: String(userRole.courseId), entityName: 'role' }),
      };
    },
  },
};
