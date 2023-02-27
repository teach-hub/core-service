import {
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLFieldConfigMap,
  Source,
} from 'graphql';

import { updateUser } from './userService';

import type { Context } from '../../types';

export const UserType: GraphQLObjectType<Source, Context> = new GraphQLObjectType({
  name: 'User',
  description: 'A non-admin user within TeachHub',
  fields: {
    userId: { type: GraphQLID },
    name: { type: GraphQLString },
    lastName: { type: GraphQLString },
    notificationEmail: { type: GraphQLString },
    file: { type: GraphQLString },
    githubId: { type: GraphQLString },
  },
});

export const userMutations: GraphQLFieldConfigMap<Source, Context> = {
  updateUser: {
    type: UserType,
    description: 'Updates a user',
    args: {
      userId: { type: new GraphQLNonNull(GraphQLID) },
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

export const userFields: GraphQLFieldConfigMap<Source, Context> = {
  findUser: {
    type: UserType,
    args: { userId: { type: GraphQLID } },
    resolve: () => ({ name: null, lastName: null }),
  },
};
