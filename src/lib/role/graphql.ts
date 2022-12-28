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
      const found = await findRole({ roleId: id });

      return {
        id: found?.id,
        name: found?.name,
        permissions: found?.permissions,
        parentRoleId: found?.parentRoleId,
        active: found?.active,
      }
    },
  },
  allRoles: {
    type: new GraphQLList(RoleType),
    description: "List of roles on the whole application",
    args: RAArgs,
    resolve: async (_: Source, { page, perPage, sortField, sortOrder }: OrderingOptions) => {
      const allRoles = await findAllRoles({ page, perPage, sortField, sortOrder });

      return allRoles.map(role => {
        return {
          id: role?.id,
          name: role?.name,
          permissions: role?.permissions,
          parentRoleId: role?.parentRoleId,
          active: role?.active,
        }
      });
    }
  },
  _allRolesMeta: {
    type: new GraphQLObjectType({
      name: 'RoleListMetadata',
      fields: { count: { type: GraphQLInt }}
    }),
    args: RAArgs,
    resolve: async () => {
      return { count: (await countRoles()) };
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

      const newRole = await createRole({ name, permissions, parentRoleId });

      return {
        id: newRole?.id,
        name: newRole?.name,
        permissions: newRole?.permissions,
        parentRoleId: newRole?.parentRoleId,
        active: newRole?.active,
      };
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

      const updated = await updateRole(id, rest)

      return {
        id: updated?.id,
        name: updated?.name,
        permissions: updated?.permissions,
        parentRoleId: updated?.parentRoleId,
        active: updated?.active,
      };
    },
  }
};

export {
  roleMutations,
  roleFields
}
