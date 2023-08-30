import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import type { Context } from '../../types';
import { exchangeCodeForToken, revokeToken } from '../../github/auth';
import { getGithubUserIdFromGithubToken } from '../../github/githubUser';
import { existsUserWithGitHubId } from '../user/userService';
import { createToken } from '../../tokens/jwt';

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
    description: 'Exchanges received code for a long-lived token.',
    args: {
      code: { type: GraphQLString },
    },
    resolve: async (_, args, { logger }) => {
      const { code } = args;

      logger.info(`[Github] Exchanging code=${code} for token`);

      const githubToken = await exchangeCodeForToken(code);

      logger.info(`[Github] Exchanging token=${githubToken} for githubId`);

      // Obtenemos el github id del usuario asociado al token.
      const githubId = await getGithubUserIdFromGithubToken(githubToken);
      const userExists = await existsUserWithGitHubId(githubId);

      logger.info(
        `Logging in user with githubId ${githubId}. User exists: ${userExists}`
      );
      return {
        token: createToken({ githubToken, userExists }),
        userRegistered: userExists,
      };
    },
  },
  logout: {
    type: Logout,
    description: 'Revokes the token from the Github app',
    args: {
      token: { type: GraphQLString },
    },
    resolve: async (_, args, ctx: Context) => {
      const { token } = args;

      const tokenRevoked: boolean = await revokeToken(token);

      ctx.logger.info(
        tokenRevoked ? `Revoked token ${token}` : `Failed to revoke token ${token}`
      );

      // Return null field as graphql does not allow empty objects
      return { token: null };
    },
  },
};
