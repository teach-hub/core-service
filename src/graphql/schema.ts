import {
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLObjectType,
} from "graphql";

const UserType = new GraphQLObjectType({
  name: "UserType",
  fields: {
    name: {
      type: GraphQLString,
    },
    lastName: {
      type: GraphQLString,
    },
  },
});

/**
 * Funcion totalmente dummy hasta que implementemos la autenticacion.
 * Una vez que tengamos eso vamos a poder tener una idea de cual es el
 * usuario logeado. Hasta entonces devolvemos simplemente el primer
 * usuario de la base.
 */

const getViewer = async () => {};

const Query = new GraphQLObjectType({
  name: "RootQueryType",
  description: "Root query",
  fields: {
    viewer: {
      description: "Logged in user",
      type: UserType,
      resolve: () => ({ name: "Tomas", lastName: "Lopez Hidalgo" }),
    },
    findUser: {
      type: UserType,
      args: { userId: { type: GraphQLID } },
      resolve: () => ({ name: null, lastName: null }),
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "RootMutationType",
  description: "Root mutation",
  fields: {
    updateUser: {
      type: UserType,
      description: "Updates a user",
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        lastName: { type: GraphQLString },
        file: { type: GraphQLString },
        githubId: { type: GraphQLString },
        notificationsEmail: { type: GraphQLString },
      },
      resolve: async () => {},
    },
  },
});

const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default schema;
