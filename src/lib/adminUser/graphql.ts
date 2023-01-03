import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLID,
  Source,
} from 'graphql';

import {
  createAdminUser,
  findAllAdminUsers,
  countAdminUsers,
  updateAdminUser, findAdminUser
} from './adminService';
import { RAArgs } from '../../graphql/utils';
import {findUser} from "../user/userService";

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
  AdminUser: {
    type: AdminUserType,
    args: { id: { type: GraphQLID }},
    resolve: async (_: Source, { id }: any) => findAdminUser({ adminUserId: id }),
  },
  allAdminUsers: {
    type: new GraphQLList(AdminUserType),
    description: "List of admin users on the whole application",
    args: RAArgs,
    resolve: async (_: Source, { page, perPage, sortField, sortOrder }: any) => {
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
      password: { type: GraphQLString },
      name: { type: new GraphQLNonNull(GraphQLString) },
      lastName: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_: Source, args: any) => {
      console.log("Executing mutation createAdminUser");

      return await createAdminUser(args);
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
    resolve: async (_: Source, { id, ...rest }: any) => {
      console.log("Executing mutation updateAdminUser");

      return updateAdminUser(id, rest)
    },
  },
}
