import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  createUser,
  existsUserWithGitHubId,
  findUserWithGithubId,
  updateUser,
  UserFields,
} from './userService';

import { toGlobalId } from '../../graphql/utils';

import type { Context } from '../../types';
import { createRegisteredUserTokenFromJwt, isRegisterToken } from '../../tokens/jwt';
import { getGithubUserId } from '../../github/githubUser';

import { getToken } from '../../utils/request';
import { isDefinedAndNotEmpty } from '../../utils/object';

export const getAuthenticatedUserFromToken = async (
  token: string
): Promise<UserFields | null> => {
  const currentUserGithubId = await getGithubUserId(token);
  const user = await findUserWithGithubId(currentUserGithubId);

  if (isDefinedAndNotEmpty(user)) return user;

  return null;
};

export const UserType: GraphQLObjectType<UserFields, Context> = new GraphQLObjectType({
  name: 'UserType',
  description: 'A non-admin user within TeachHub',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'user',
          dbId: String(s.id),
        }),
    },
    name: { type: new GraphQLNonNull(GraphQLString) },
    active: { type: new GraphQLNonNull(GraphQLBoolean) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    notificationEmail: { type: new GraphQLNonNull(GraphQLString) },
    file: { type: new GraphQLNonNull(GraphQLString) },
    githubId: { type: new GraphQLNonNull(GraphQLString) },
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

      if (await existsUserWithGitHubId(githubId)) {
        throw new Error('GitHub user already registered');
      }

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
  updateViewerUser: {
    type: UserType,
    description: 'Updates viewer user',
    args: {
      name: { type: GraphQLString },
      lastName: { type: GraphQLString },
      file: { type: GraphQLString },
      githubId: { type: GraphQLString },
      notificationEmail: { type: GraphQLString },
    },
    resolve: async (_, args, ctx) => {
      const viewer = await getViewer(ctx);
      const { ...rest } = args;

      ctx.logger.info('Executing updateUser mutation with values', args);

      // @ts-expect-error. FIXME
      return updateUser(viewer.id, rest);
    },
  },
};

export const getViewer = async (ctx: Context): Promise<UserFields> => {
  const token = getToken(ctx);

  if (!token) {
    throw new Error('No token provided');
  }

  const viewer = await getAuthenticatedUserFromToken(token);
  if (!viewer) {
    ctx.logger.error(`No user found for token ${token}`);
    throw new Error('Internal server error');
  }

  ctx.logger.info(`Found viewer with user ID ${viewer.id}`);

  return {
    id: viewer.id,
    githubId: viewer.githubId,
    name: viewer.name,
    lastName: viewer.lastName,
    notificationEmail: viewer.notificationEmail,
    file: viewer.file,
    active: viewer.active,
  };
};
