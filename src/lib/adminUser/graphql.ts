import { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLID } from 'graphql';

import {
  createAdminUser,
  findAllAdminUsers,
  countAdminUsers,
  updateAdminUser,
  findAdminUser,
  findAdminUserByBasic,
} from './adminService';

import { buildEntityFields } from '../../graphql/fields';
import { buildEntityMutations } from '../../graphql/mutations';

import type { Context } from 'src/types';

export function getAuthenticatedAdminFromRequest(username: string, password: string) {
  return findAdminUserByBasic({ username, password });
}

const AdminUserType: GraphQLObjectType<unknown, Context> = new GraphQLObjectType({
  name: 'AdminUser',
  description: 'An admin user within TeachHub',
  fields: {
    id: { type: GraphQLID },
    email: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLString },
    lastName: { type: GraphQLString },
  },
});

const findAdminUserCallback = (id: number) => {
  return findAdminUser({ adminUserId: id });
};

const adminUserFields = buildEntityFields({
  type: AdminUserType,
  keyName: 'AdminUser',
  findCallback: findAdminUserCallback,
  findAllCallback: findAllAdminUsers,
  countCallback: countAdminUsers,
});

const mutations = buildEntityMutations({
  entityGraphQLType: AdminUserType,
  entityName: 'AdminUser',
  createOptions: {
    args: {
      email: { type: new GraphQLNonNull(GraphQLString) },
      name: { type: GraphQLString },
      lastName: { type: GraphQLString },
    },
    callback: createAdminUser,
  },
  updateOptions: {
    args: {
      id: { type: GraphQLID },
      email: { type: new GraphQLNonNull(GraphQLString) },
      name: { type: GraphQLString },
      lastName: { type: GraphQLString },
    },
    callback: updateAdminUser,
  },
  deleteOptions: {
    findCallback: findAdminUserCallback,
  },
});

const adminUserMutations = {
  ...mutations,
  createAdminUser: {
    type: new GraphQLObjectType({
      name: 'CreateAdminUser',
      fields: {
        id: { type: GraphQLID },
        email: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        lastName: { type: GraphQLString },
        password: { type: GraphQLString },
      },
    }),
    args: {
      email: { type: new GraphQLNonNull(GraphQLString) },
      name: { type: GraphQLString },
      lastName: { type: GraphQLString },
    },
    resolve: async (_: unknown, args: Record<string, string>) => {
      const { email, name, lastName } = args;

      return createAdminUser({ email, name, lastName });
    },
  },
};

export { adminUserMutations, adminUserFields };
