import {
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLList,
  GraphQLObjectType,
  GraphQLFieldConfigMap,
} from 'graphql';

import { UserFields, updateUser } from './userService';
import { findAllUserRoles } from '../userRole/userRoleService';

import { toGlobalId } from '../../graphql/utils';

import type { Context } from '../../types';

export const UserType: GraphQLObjectType<UserFields, Context> = new GraphQLObjectType({
  name: 'UserType',
  description: 'A non-admin user within TeachHub',
  fields: () => {
    const UserRoleType = require('../userRole/internalGraphql').UserRoleType;

    return {
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
      userRoles: {
        type: new GraphQLList(UserRoleType),
        resolve: user => {
          return findAllUserRoles({ forUserId: user.id });
        },
      },
    };
  },
});

export const userMutations: GraphQLFieldConfigMap<unknown, Context> = {
  updateUser: {
    type: UserType,
    description: 'Updates a user',
    args: {
      userId: {
        // FIXME;
        type: new GraphQLNonNull(GraphQLID),
      },
      name: { type: GraphQLString },
      lastName: { type: GraphQLString },
      file: { type: GraphQLString },
      githubId: { type: GraphQLString },
      notificationEmail: { type: GraphQLString },
    },
    resolve: async (_, args, ctx) => {
      const { userId, ...rest } = args;

      ctx.logger.info('Executing updateUser mutation with values', args);

      // @ts-expect-error
      const updatedUser = await updateUser(userId, rest);
      return updatedUser;
    },
  },
};
