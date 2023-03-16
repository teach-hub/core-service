import {
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLObjectType,
} from 'graphql';

import type { Context } from 'src/types';

import { findRole } from './roleService';

export const RoleType: GraphQLObjectType<any, Context> = new GraphQLObjectType({
  name: 'RoleType',
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    permissions: { type: new GraphQLList(GraphQLString) },
    active: { type: GraphQLBoolean },
    parent: {
      type: RoleType,
      resolve: async (source, _, context) => {
        const { logger } = context;
        const { id, parentRoleId } = source;

        logger.info(`Resolving parent role for role ${id}`);

        const parentRole = await findRole({ roleId: parentRoleId });

        return parentRole;
      },
    },
  }),
});
