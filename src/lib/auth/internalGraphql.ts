import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';

import { findAdminUserByBasic } from '../adminUser/adminService';

import type { Context } from '../../types';

export const LoginType: GraphQLObjectType<unknown, Context> = new GraphQLObjectType({
  name: 'LoginPayloadType',
  description: 'Authenticated data',
  fields: {
    success: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
  },
});

export const Logout: GraphQLObjectType<unknown, Context> = new GraphQLObjectType({
  name: 'Logout',
  description: 'Logout data',
  fields: {
    success: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
  },
});

export const authMutations: GraphQLFieldConfigMap<unknown, Context> = {
  login: {
    type: new GraphQLNonNull(LoginType),
    description: 'Login as an admin',
    args: {
      email: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_, { email, password }, { logger }) => {
      logger.info('Authenticating user', { email });

      const admin = await findAdminUserByBasic({ username: email, password });

      return { success: !!admin };
    },
  },
  logout: {
    type: Logout,
    description: 'Revokes the token from the Github app',
    args: {
      token: { type: GraphQLString },
    },
    resolve: async () => {
      return { success: true };
    },
  },
};
