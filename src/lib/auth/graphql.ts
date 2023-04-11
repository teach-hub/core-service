import {
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLFieldConfigMap,
} from 'graphql';
import type { Context } from '../../types';
import { exchangeCodeForToken, revokeToken } from '../../github/auth';

export const Login: GraphQLObjectType<unknown, Context> = new GraphQLObjectType({
  name: 'Login',
  description: 'Authenticated data',
  fields: {
    token: { type: GraphQLString },
  },
});

export const Logout: GraphQLObjectType<unknown, Context> = new GraphQLObjectType({
  name: 'Logout',
  description: 'Logout data',
  fields: {
    token: { type: GraphQLString },
  },
});

export const authMutations: GraphQLFieldConfigMap<unknown, Context> = {
  login: {
    type: Login,
    description: 'Login user',
    args: {
      code: { type: GraphQLString },
    },
    resolve: async (_, args, __) => {
      const { code } = args;

      return {
        token: await exchangeCodeForToken(code),
      };
    },
  },
  logout: {
    type: Logout,
    description: 'Logout user',
    args: {
      token: { type: GraphQLString },
    },
    resolve: async (_, args, ctx: Context) => {
      const { token } = args;

      const tokenRevoked: boolean = await revokeToken(token);

      tokenRevoked
        ? ctx.logger.info(`Revoked token ${token}`)
        : ctx.logger.info(`Failed to revoke token ${token}`);

      return {
        token: null, // Return null field as graphql does not allow empty objects
      };
    },
  },
};
