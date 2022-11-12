import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLID,
  Source,
} from 'graphql';

import {
  createUser,
  findAllUsers,
  findUser,
  updateUser,
  countUsers,
} from './userService';

import { RAArgs } from '../../graphql/utils';

const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'A non-admin user within TeachHub',
  fields: {
    id: { type: GraphQLID },
    githubId: { type: GraphQLString },
    name: { type: GraphQLString },
    lastName: { type: GraphQLString },
    notificationEmail: { type: GraphQLString },
    file: { type: GraphQLString },
    active: { type: GraphQLBoolean },
  }
});

export const userFields = {
  User: {
    type: UserType,
    args: { id: { type: GraphQLID }},
    resolve: async (_: Source, { id }: any) => findUser({ userId: id }),
  },
  allUsers: {
    type: new GraphQLList(UserType),
    description: "List of users on the whole application",
    args: RAArgs,
    resolve: async (_: Source, { page, perPage, sortField, sortOrder }: any) => {
      return findAllUsers({ page, perPage, sortField, sortOrder });
    }
  },
  _allUsersMeta: {
    type: new GraphQLObjectType({
      name: 'UserListMetadata',
      fields: { count: { type: GraphQLInt }}
    }),
    args: RAArgs,
    resolve: async () => {
      return { count: (await countUsers()) };
    }
  }
}

export const userMutations = {
  createUser: {
    type: UserType, // Output type
    description: 'Creates a new non-admin user assigning',
    args: {
      name: { type: new GraphQLNonNull(GraphQLString) },
      lastName: { type: new GraphQLNonNull(GraphQLString) },
      githubId: { type: new GraphQLNonNull(GraphQLString) },
      notificationEmail: { type: new GraphQLNonNull(GraphQLString) },
      file: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_: Source, { name, code }: any) => {
      console.log("Executing mutation createUser");

      return await createUser({ name, code });
    }
  },
  updateUser: {
    type: UserType,
    description: 'Update non-admin user record on TeachHub',
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      lastName: { type: new GraphQLNonNull(GraphQLString) },
      githubId: { type: new GraphQLNonNull(GraphQLString) },
      notificationEmail: { type: new GraphQLNonNull(GraphQLString) },
      file: { type: new GraphQLNonNull(GraphQLString) },
      active: { type: new GraphQLNonNull(GraphQLBoolean) },
    },
    resolve: async (_: Source, { id, ...rest }: any) => {
      console.log("Executing mutation updateUser");

      return updateUser(id, rest)
    }
  }
}
