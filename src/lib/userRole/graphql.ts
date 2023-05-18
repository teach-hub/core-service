import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLBoolean } from 'graphql';

import {
  createUserRole,
  findAllUserRoles,
  findUserRole,
  updateUserRole,
  countUserRoles,
} from './userRoleService';

import { buildEntityFields } from '../../graphql/fields';
import { buildEntityMutations } from '../../graphql/mutations';

import type { Context } from 'src/types';

const getFields = ({ addId }: { addId: boolean }) => {
  const fields = {
    ...(addId ? { id: { type: GraphQLID } } : {}),
    courseId: { type: GraphQLString },
    roleId: { type: GraphQLString },
    userId: { type: GraphQLString },
    active: { type: GraphQLBoolean },
  };

  return fields;
};

export const UserRoleType: GraphQLObjectType<unknown, Context> = new GraphQLObjectType({
  name: 'UserRole',
  description: 'A role within TeachHub',
  fields: getFields({ addId: true }),
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
  createFields: getFields({ addId: false }),
  updateFields: getFields({ addId: true }),
  createCallback: createUserRole,
  updateCallback: updateUserRole,
  findCallback: findUserRoleCallback,
});

export { userRoleMutations, userRoleFields };
