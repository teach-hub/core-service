import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import type { Context } from '../../types';
import { exchangeCodeForToken, revokeToken } from '../../github/auth';
import { getGithubUserIdFromGithubToken } from '../../github/githubUser';
import { existsUserWithGitHubId } from '../user/userService';
import { createToken } from '../../tokens/jwt';
import logger from '../../logger';

export const Login: GraphQLObjectType<unknown, Context> = new GraphQLObjectType({
  name: 'Login',
  description: 'Authenticated data',
  fields: {
    token: { type: GraphQLString },
    userRegistered: { type: GraphQLBoolean },
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
    resolve: async (_, args, { logger }) => {
      const { code } = args;

      logger.info(`Getting token for code ${code}`);

      const githubToken = await exchangeCodeForToken(code);
      const githubId = await getGithubUserIdFromGithubToken(githubToken);

      const userExists = await existsUserWithGitHubId(githubId);

      logger.info(
        `Logging in user with githubId ${githubId}. User exists: ${userExists}`
      );
      return {
        token: createToken({
          githubToken,
          userExists,
        }),
        userRegistered: userExists,
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
