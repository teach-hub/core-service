import { GraphQLString, GraphQLInt, GraphQLNonNull } from 'graphql';

const RAArgs = {
  page: { type: GraphQLInt },
  perPage: { type: GraphQLInt },
  sortField: { type: GraphQLString },
  sortOrder: { type: GraphQLString },
}

type GraphqlObjectTypeFields = Record<any, any>

export {
  RAArgs,
  GraphqlObjectTypeFields
}
