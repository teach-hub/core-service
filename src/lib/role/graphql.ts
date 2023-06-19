import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  countRoles,
  createRole,
  findAllRoles,
  findRole,
  updateRole,
} from './roleService';

import { buildEntityFields } from '../../graphql/fields';
import { buildEntityMutations } from '../../graphql/mutations';

import type { Context } from 'src/types';

const buildGraphQLFields = ({ includeId }: { includeId: boolean }) => {
  return {
    ...(includeId
      ? {
          id: {
            type: GraphQLID,
          },
        }
      : {}),
    name: {
      type: GraphQLString,
    },
    permissions: {
      type: new GraphQLList(GraphQLString),
    },
    parentRoleId: {
      type: GraphQLID,
    },
    active: {
      type: GraphQLBoolean,
    },
    isTeacher: {
      type: GraphQLBoolean,
    },
  };
};

export const RoleType: GraphQLObjectType<unknown, Context> = new GraphQLObjectType({
  name: 'Role',
  description: 'A role within TeachHub',
  fields: buildGraphQLFields({ includeId: true }),
});

const roleFields = buildEntityFields({
  type: RoleType,
  keyName: 'Role',
  findCallback: id => findRole({ roleId: id }),
  findAllCallback: findAllRoles,
  countCallback: countRoles,
});

const roleMutations = buildEntityMutations({
  entityName: 'Role',
  entityGraphQLType: RoleType,
  createOptions: {
    callback: createRole,
    args: buildGraphQLFields({ includeId: false }),
  },
  updateOptions: {
    callback: updateRole,
    args: buildGraphQLFields({ includeId: true }),
  },
  deleteOptions: {
    findCallback: id => findRole({ roleId: id }),
  },
});

export { roleMutations, roleFields };
