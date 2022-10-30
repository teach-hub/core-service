import { GraphQLSchema, GraphQLObjectType } from 'graphql';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'Root query',
    fields: {},
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    description: 'Root mutation',
    fields: {}
  })
});

export default schema;
