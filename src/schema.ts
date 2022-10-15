import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

const AppType = new GraphQLObjectType({
  name: 'AppType',
  description: 'An instance of current app',
  fields: {
    version: {
      description: 'Version of current app',
      type: GraphQLString,
    }
  }
})

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'Root query',
    fields: {
      app: {
        description: 'App field on root query',
        type: AppType,
        resolve: () => ({
          version: 'v0.0.1'
        }),
      }
    },
  }),
});

export default schema;
