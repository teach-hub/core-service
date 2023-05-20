import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLList,
  GraphQLObjectType,
} from 'graphql';

import type { Context } from 'src/types';

import { findRole } from './roleService';

import { toGlobalId } from '../../graphql/utils';

export const RoleType: GraphQLObjectType<any, Context> = new GraphQLObjectType({
  name: 'RoleType',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: role => {
        return toGlobalId({
          entityName: 'role',
          dbId: String(role.id),
        });
      },
    },
    name: { type: new GraphQLNonNull(GraphQLString) },
    permissions: { type: new GraphQLList(GraphQLString) },
    active: { type: new GraphQLNonNull(GraphQLBoolean) },
    isTeacher: { type: new GraphQLNonNull(GraphQLBoolean) },
    parent: {
      type: RoleType,
      resolve: async (source, _, context) => {
        const { logger } = context;
        const { id, parentRoleId } = source;

        if (!parentRoleId) {
          return null;
        }

        logger.info(`Resolving parent role for role ${id}`);

        const parentRole = await findRole({ roleId: parentRoleId });

        return parentRole;
      },
    },
  }),
});
