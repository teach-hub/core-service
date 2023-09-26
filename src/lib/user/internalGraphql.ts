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
  findUser,
  updateUser,
  UserFields,
} from './userService';

import { toGlobalId } from '../../graphql/utils';

import { getGithubUserId, getGithubUsernameFromGithubId } from '../../github/githubUser';

import { getToken } from '../../utils/request';
import { initOctokit } from '../../github/config';

import type { AuthenticatedContext } from '../../context';

export const getAuthenticatedUserFromToken = async (
  token: string
): Promise<UserFields | null> => {
  // Algo que se podria hacer es que nustra referencia en el contexto
  // sea el githubId y no el id de la base de datos.
  // Esto nos permitiria desacoplar esta busqueda y tomar
  // como authenticado a cualquier usuario que tenga un githubId
  // (que es la definicion de authenticado).

  const currentUserGithubId = await getGithubUserId(token);
  const user = await findUserWithGithubId(currentUserGithubId);

  if (user) {
    return user;
  }

  return null;
};

export const UserType: GraphQLObjectType<UserFields, AuthenticatedContext> =
  new GraphQLObjectType({
    name: 'UserType',
    description: 'A non-admin user within TeachHub',
    fields: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        resolve: s =>
          toGlobalId({
            entityName: 'user',
            dbId: s.id!,
          }),
      },
      name: { type: new GraphQLNonNull(GraphQLString) },
      active: { type: new GraphQLNonNull(GraphQLBoolean) },
      lastName: { type: new GraphQLNonNull(GraphQLString) },
      notificationEmail: { type: new GraphQLNonNull(GraphQLString) },
      file: { type: new GraphQLNonNull(GraphQLString) },
      githubId: { type: new GraphQLNonNull(GraphQLString) },
      githubUserName: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: async (user, _, ctx) => {
          // FIXME. La logica de autentication no deberia estar aca.
          //
          const token = getToken(ctx);
          if (!token) throw new Error('Token required');
          if (!user.githubId) throw new Error('User missing githubId');

          return getGithubUsernameFromGithubId(initOctokit(token), user.githubId);
        },
      },
    },
  });

export const userMutations: GraphQLFieldConfigMap<unknown, AuthenticatedContext> = {
  registerUser: {
    type: new GraphQLNonNull(UserType),
    description: 'Creates a user and authorizes it',
    args: {
      name: { type: GraphQLString },
      lastName: { type: GraphQLString },
      file: { type: GraphQLString },
      notificationEmail: { type: GraphQLString },
    },
    resolve: async (_, args, ctx) => {
      const { name, lastName, file, notificationEmail } = args;

      // Tenemos que manejar la autentication de este lado porque el usuario
      // todavia no esta creado, entonces no tenemos userId.
      const token = getToken(ctx);

      if (!token) {
        throw new Error('Token required');
      }

      const githubId = await getGithubUserId(token);

      if (await existsUserWithGitHubId(githubId)) {
        throw new Error('GitHub user already created');
      }

      ctx.logger.info(`Creating user with githubId ${githubId} and args ${args}`);

      return createUser({
        name,
        lastName,
        githubId,
        notificationEmail,
        file,
      });
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

/**
 * @deprecated: Usar findUser en su lugar.
 */
export const getViewer = async (ctx: AuthenticatedContext): Promise<UserFields | null> => {
  const { viewerUserId } = ctx;

  ctx.logger.info(`Found viewer with user ID ${viewerUserId}`);

  const viewer = await findUser({ userId: viewerUserId });

  if (!viewer) {
    return null;
  }

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
