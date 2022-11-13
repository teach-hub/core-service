import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLID,
  GraphQLBoolean,
  Source
} from 'graphql';

const RoleType = new GraphQLObjectType({
  name: 'Role',
  description: 'A role within TeachHub',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    organization: { type: GraphQLString },
    period: { type: GraphQLString },
    year: { type: GraphQLInt },
    subjectId: { type: GraphQLInt },
    active: { type: GraphQLBoolean }
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
    type: RoleType, // Output type
    description: 'Creates a new role assigning name and department code',
    args: {
      name: { type: GraphQLString },
      organization: { type: GraphQLString },
      period: { type: GraphQLInt },
      year: { type: GraphQLInt },
      subjectId: { type: GraphQLInt }
    },
    resolve: async (_: Source, { name, year, period, organization, subjectId }: any) => {
      console.log("Executing mutation createRole");

      return await createRole({ name, year, period, organization, subjectId });
    }
  },
  updateRole: {
    type: RoleType,
    description: 'Update role record on TeachHub',
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      organization: { type: GraphQLString },
      period: { type: GraphQLInt },
      year: { type: GraphQLInt },
      subjectId: { type: GraphQLInt },
      active: { type: GraphQLBoolean }
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
