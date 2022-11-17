import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLID,
  GraphQLBoolean,
  Source
} from 'graphql';

import {
  createRole,
  findAllRoles,
  findRole,
  updateRole,
  countRoles,
} from './roleService';

import { ALL_ROLES } from '../../consts';
import { RAArgs } from '../../graphql/utils';

const RoleType = new GraphQLObjectType({
  name: 'Role',
  description: 'A role within TeachHub',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },

  /**
    * (Tomas) Lista de permisos que podemos setear. Esto podria vivir
    * en el/los front tambien. Queremos hacerlo de esta forma para
    * despues poder asociar un permiso a una serie de acciones posibles.
    * Si estos permisos fuesen dinamicos despues tendriamos que
    * agregar algun flujo para asociar esos permisos a acciones posibles
    * (en ese caso las acciones estarian fixeadas).
    */
    availablePermissions: { type: new GraphQLList(GraphQLString) },

  /**
    * Permisos seteados actualmente para este rol
    */
    permissions: { type: GraphQLString },
    parentRoleId: { type: GraphQLString },
    active: { type: GraphQLBoolean },
  }
});

const roleFields = {
  Role: {
    type: RoleType,
    args: { id: { type: GraphQLID }},
    resolve: async (_: Source, { id }: any) => findRole({ roleId: id }),
  },
  allRoles: {
    type: new GraphQLList(RoleType),
    description: "List of roles on the whole application",
    args: RAArgs,
    resolve: async (_: Source, { page, perPage, sortField, sortOrder }: any) => {
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

      return ;
    }
  },
  updateRole: {
    type: RoleType,
    description: 'Update role record on TeachHub',
    args: {
      id: { type: GraphQLID },
      name: { type: GraphQLString },
      permissions: { type: GraphQLString },
      parentRoleId: { type: GraphQLID },
      active: { type: GraphQLBoolean },
    },
    resolve: async (_: Source, { id, ...rest }: any) => {
      console.log("Executing mutation updateRole");

      return updateRole(id, rest)
    },
  }
};

export {
  roleMutations,
  roleFields
}
