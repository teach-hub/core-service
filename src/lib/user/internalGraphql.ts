import {
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
  Source,
} from 'graphql';

import { updateUser } from './userService';

export const UserType = new GraphQLObjectType({
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

export const userMutations = {
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
    resolve: async (_: Source, args: any) => {
      const { userId, ...rest } = args;

      console.log('Executing updateUser mutation with values', args);

      const updatedUser = await updateUser(userId, rest);
      return updatedUser;
    },
  },
};

export const userFields = {
  findUser: {
    type: UserType,
    args: { userId: { type: GraphQLID } },
    resolve: () => ({ name: null, lastName: null }),
  },
};
