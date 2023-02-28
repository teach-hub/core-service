import { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLID } from 'graphql';

import {
  createAdminUser,
  findAllAdminUsers,
  countAdminUsers,
  updateAdminUser,
  findAdminUser,
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

const AdminUserType: GraphQLObjectType<unknown, Context> = new GraphQLObjectType({
  name: 'AdminUser',
  description: 'A role within TeachHub',
  fields: getFields({ isUpdate: true }),
});

const findAdminUserCallback = (id: string) => {
  return findAdminUser({ adminUserId: id });
};

const adminUserFields = buildEntityFields({
  type: AdminUserType,
  keyName: 'AdminUser',
  typeName: 'user role',
  findCallback: findAdminUserCallback,
  findAllCallback: findAllAdminUsers,
  countCallback: countAdminUsers,
});

const adminUserMutations = buildEntityMutations({
  type: AdminUserType,
  keyName: 'AdminUser',
  typeName: 'admin user',
  createFields: getFields({ isUpdate: false }),
  updateFields: getFields({ isUpdate: true }),
  createCallback: createAdminUser,
  updateCallback: updateAdminUser,
  findCallback: findAdminUserCallback,
});

export { adminUserMutations, adminUserFields };
