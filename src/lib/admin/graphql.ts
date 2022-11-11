import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLID,
} from 'graphql';

import { 
  createAdminUser, 
  findAllAdminUsers, 
  countAdminUsers, 
  updateAdminUser 
} from './adminService';
import { RAArgs } from '../../graphql/utils';

const AdminUserType = new GraphQLObjectType({
  name: 'AdminUser',
  description: 'An admin user within TeachHub',
  fields: {
    id: { type: GraphQLID },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    name: { type: GraphQLString },
    lastName: { type: GraphQLString }
  }
});

export const adminUserFields = {
  allAdminUsers: {
    type: new GraphQLList(AdminUserType),
    description: "List of admin users on the whole application",
    args: RAArgs,
    resolve: async (_: any, { page, perPage, sortField, sortOrder }: any) => {
      return findAllAdminUsers({ page, perPage, sortField, sortOrder });
    }
  },
  _allAdminUsersMeta: {
    type: new GraphQLObjectType({
      name: 'AdminUserListMetadata',
      fields: { count: { type: GraphQLInt }}
    }),
    args: RAArgs,
    resolve: async () => {
      return { count: (await countAdminUsers()) };
    }
  }
}

export const adminUserMutations = {
  createAdminUser: {
    type: AdminUserType, // Output type
    description: 'Creates a new admin user',
    args: {
      email: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      lastName: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_: any, { name, lastName, email, password }: any) => {
      console.log("Executing mutation createAdminUser");

      return await createAdminUser({ email, password, name, lastName  });
    }
  },
  updateAdminUser: {
    type: AdminUserType,
    description: 'Update subject record on TeachHub',
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      email: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      lastName: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_: any, { id, ...rest }: any) => {
      console.log("Executing mutation updateAdminUser");

      return updateAdminUser(id, rest)
    },
  },
}
