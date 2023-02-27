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
  createRole,
  findAllRoles,
  findRole,
  updateRole,
  countRoles,
} from './roleService';

import { buildEntityFields } from '../../graphql/fields';
import { buildEntityMutations } from '../../graphql/mutations';

const getFields = ({ addId }: { addId: boolean }) => {
  const fields = {
    ...(addId ? { id: { type: GraphQLID } } : {}),
    name: { type: GraphQLString },
    permissions: { type: new GraphQLList(GraphQLString) },
    parentRoleId: { type: GraphQLID },
    active: { type: GraphQLBoolean },
  };

  return fields;
};

const RoleType = new GraphQLObjectType({
  name: 'Role',
  description: 'A role within TeachHub',
  fields: getFields({ addId: true }),
});

const findRoleCallback = (id: string) => {
  return findRole({ roleId: id });
};

const roleFields = buildEntityFields({
  type: RoleType,
  keyName: 'Role',
  typeName: 'role',
  findCallback: findRoleCallback,
  findAllCallback: findAllRoles,
  countCallback: countRoles,
});

const roleMutations = buildEntityMutations({
  type: RoleType,
  keyName: 'Role',
  typeName: 'role',
  createFields: getFields({ addId: false }),
  updateFields: getFields({ addId: true }),
  createCallback: createRole,
  updateCallback: updateRole,
  findCallback: findRoleCallback,
});

export { roleMutations, roleFields };
