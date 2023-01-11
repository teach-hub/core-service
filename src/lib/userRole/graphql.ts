import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLID,
  GraphQLBoolean,
  GraphQLNonNull,
  Source,
} from 'graphql';

import {
  createUserRole,
  findAllUserRoles,
  findUserRole,
  updateUserRole,
  countUserRoles,
} from './userRoleService';

import { GraphqlObjectTypeFields } from '../../graphql/utils';
import { buildEntityFields } from '../../graphql/fields';
import { buildEntityMutations } from '../../graphql/mutations';

const getFields = (addIdd: boolean) => {
  const fields: GraphqlObjectTypeFields = {
    courseId: { type: GraphQLString },
    roleId: { type: GraphQLString },
    userId: { type: GraphQLString },
    active: { type: GraphQLBoolean },
  };
  if (addIdd) fields.id = { type: GraphQLID };

  return fields;
};

const UserRoleType = new GraphQLObjectType({
  name: 'UserRole',
  description: 'A role within TeachHub',
  fields: getFields(true),
});

const findUserRoleCallback = (id: string) => {
  return findUserRole({ roleId: id });
};

const userRoleFields = buildEntityFields({
  type: UserRoleType,
  keyName: 'UserRole',
  typeName: 'user role',
  findCallback: findUserRoleCallback,
  findAllCallback: findAllUserRoles,
  countCallback: countUserRoles,
});
const userRoleMutations = buildEntityMutations({
  type: UserRoleType,
  keyName: 'UserRole',
  typeName: 'user role',
  createFields: getFields(false),
  updateFields: getFields(true),
  createCallback: createUserRole,
  updateCallback: updateUserRole,
  findCallback: findUserRoleCallback,
});

export { userRoleMutations, userRoleFields };
