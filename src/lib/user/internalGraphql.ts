import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  createUser,
  existsUserWithGitHubId,
  updateUser,
  UserFields,
} from './userService';

import { fromGlobalId, toGlobalId } from '../../graphql/utils';

import type { Context } from '../../types';
import { getToken } from '../../requestUtils';
import { createRegisteredUserTokenFromJwt, isRegisterToken } from '../../tokens/jwt';
import { getGithubUserId } from '../../github/githubUser';

export const UserType: GraphQLObjectType<UserFields, Context> = new GraphQLObjectType({
  name: 'UserType',
  description: 'A non-admin user within TeachHub',
  fields: {
    id: {
      type: GraphQLString,
      resolve: s =>
        toGlobalId({
          entityName: 'user',
          dbId: String(s.id) as string,
        }),
    },
    name: { type: GraphQLString },
    active: { type: GraphQLBoolean },
    lastName: { type: GraphQLString },
    notificationEmail: { type: GraphQLString },
    file: { type: GraphQLString },
    githubId: { type: GraphQLString },
  },
});

const RegisterType: GraphQLObjectType<UserFields, Context> = new GraphQLObjectType({
  name: 'RegisterType',
  description: 'Registered user data',
  fields: {
    token: { type: GraphQLString },
  },
});

export const userMutations: GraphQLFieldConfigMap<unknown, Context> = {
  updateUser: {
    type: UserType,
    description: 'Updates a user',
    args: {
      userId: { type: new GraphQLNonNull(GraphQLString) },
      name: { type: GraphQLString },
      lastName: { type: GraphQLString },
      file: { type: GraphQLString },
      githubId: { type: GraphQLString },
      notificationEmail: { type: GraphQLString },
    },
    resolve: async (_, args, ctx) => {
      const { userId, ...rest } = args;
      const { dbId } = fromGlobalId(userId);

      ctx.logger.info('Executing updateUser mutation with values', args);

      // @ts-expect-error
      return updateUser(dbId, rest);
    },
  },
  registerUser: {
    type: RegisterType,
    description: 'Creates a user and authorizes it',
    args: {
      name: { type: GraphQLString },
      lastName: { type: GraphQLString },
      file: { type: GraphQLString },
      notificationEmail: { type: GraphQLString },
    },
    resolve: async (_, args, ctx) => {
      const { name, lastName, file, notificationEmail } = args;

      const token = getToken(ctx);

      /* Check that token exists and is for user registration */
      if (!token) throw new Error('Token required');
      if (!isRegisterToken({ token })) throw new Error('Invalid token for registration');

      /* Get GitHub user id from the token and check that no user exists with that id*/
      const githubId = await getGithubUserId(token);

      if (await existsUserWithGitHubId(githubId))
        throw new Error('GitHub user already registered');

      ctx.logger.info(
        `Registering user with githubId ${githubId} and args ${JSON.stringify(args)}`
      );

      const userData: UserFields = {
        id: undefined,
        active: true,
        githubId,
        name,
        lastName,
        notificationEmail,
        file,
      };

      /* Create new user and return token from a registered user */
      await createUser(userData);

      return {
        token: createRegisteredUserTokenFromJwt({ token }),
      };
    },
  },
};
