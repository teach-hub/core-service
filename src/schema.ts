import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      ping: {
        type: GraphQLString,
        resolve: () => {
          return 'pong';
        },
      },
    },
  }),
});

export default schema;
