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

const getFields = ({ isUpdate }: { isUpdate: boolean }) => {
  const fields = {
    ...(isUpdate
      ? { id: { type: GraphQLID }, password: { type: new GraphQLNonNull(GraphQLString) } }
      : {}),
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    name: { type: GraphQLString },
    lastName: { type: GraphQLString },
  };

  return fields;
};

export function getAuthenticatedAdminFromRequest(username: string, password: string) {
  return findAdminUserByBasic({ username, password });
}

const AdminUserType: GraphQLObjectType<unknown, Context> = new GraphQLObjectType({
  name: 'AdminUser',
  description: 'An admin user within TeachHub',
  fields: getFields({ isUpdate: true }),
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

const adminUserMutations = buildEntityMutations({
  entityGraphQLType: AdminUserType,
  entityName: 'AdminUser',
  createOptions: {
    args: getFields({ isUpdate: false }),
    callback: createAdminUser,
  },
  updateOptions: {
    args: getFields({ isUpdate: true }),
    callback: updateAdminUser,
  },
  deleteOptions: {
    findCallback: findAdminUserCallback,
  },
});

export { adminUserMutations, adminUserFields };
