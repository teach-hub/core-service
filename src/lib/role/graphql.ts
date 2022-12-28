import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLID,
  GraphQLBoolean,
  GraphQLNonNull,
  Source
} from 'graphql';

import {
  createRole,
  findAllRoles,
  findRole,
  updateRole,
  countRoles,
} from './roleService';

import { RAArgs } from '../../graphql/utils';
import { OrderingOptions } from '../../utils';

const RoleType = new GraphQLObjectType({
  name: 'Role',
  description: 'A role within TeachHub',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },

  /**
    * Permisos seteados actualmente para este rol
    */
    permissions: { type: new GraphQLList(GraphQLString) },
    parentRoleId: { type: GraphQLString },
    active: { type: GraphQLBoolean },
  }
});

const roleFields = {
  Role: {
    type: RoleType,
    args: { id: { type: new GraphQLNonNull(GraphQLID) }},
    resolve: async (_: Source, { id }: any) => {
      return findRole({ roleId: id });
    },
  },
  allRoles: {
    type: new GraphQLList(RoleType),
    description: "List of roles on the whole application",
    args: RAArgs,
    resolve: async (_: Source, { page, perPage, sortField, sortOrder }: OrderingOptions) => {
      return findAllRoles({ page, perPage, sortField, sortOrder });
    }
  },
  _allRolesMeta: {
    type: new GraphQLObjectType({
      name: 'RoleListMetadata',
      fields: { count: { type: GraphQLInt }}
    }),
    args: RAArgs,
    resolve: async () => {
      return countRoles().then(count => ({ count }));
    }
  }
};

const roleMutations = {
  createRole: {
    type: RoleType,
    description: 'Creates a new role',
    args: {
      name: { type: GraphQLString },
      permissions: { type: new GraphQLList(GraphQLString) },
      parentRoleId: { type: GraphQLID },
    },
    resolve: async (_: Source, { name, permissions, parentRoleId }: any) => {
      console.log("Executing mutation createRole");

      return createRole({ name, permissions, parentRoleId });
    }
  },
  updateRole: {
    type: RoleType,
    description: 'Update role record on TeachHub',
    args: {
      id: { type: GraphQLID },
      name: { type: GraphQLString },
      permissions: { type: new GraphQLList(GraphQLString) },
      parentRoleId: { type: GraphQLID },
      active: { type: GraphQLBoolean },
    },
    resolve: async (_: Source, { id, ...rest }: any) => {
      console.log("Executing mutation updateRole");

      return updateRole(id, rest)
    },
  },
  deleteRole: {
    type: RoleType,
    args: { id: { type: new GraphQLNonNull(GraphQLID) }},
    resolve: async (_: Source, { id }: any) => {

      console.log("Would delete role: ", { id })

    /**
      * (Tomas): No borramos entidades por el momento.
      */

      return findRole({ roleId: id });
    }
  }
};

export {
  roleMutations,
  roleFields
}
