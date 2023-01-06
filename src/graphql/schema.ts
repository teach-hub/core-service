import {
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
  GraphQLObjectType,
} from "graphql";

const UserType = new GraphQLObjectType({
  name: "UserType",
  fields: {
    name: {
      type: GraphQLString,
    },
    surname: {
      type: GraphQLString,
    },
  },
});

const Query = new GraphQLObjectType({
  name: "RootQueryType",
  description: "Root query",
  fields: {
    viewer: {
      description: "Logged in user",
      type: UserType,
      resolve: () => ({ name: null, surname: null }),
    },
    findUser: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve: () => ({ name: null, surname: null }),
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "RootMutationType",
  description: "Root mutation",
  fields: {},
});

const schema = new GraphQLSchema({
  query: Query,
  // mutation: Mutation
});

export default schema;
