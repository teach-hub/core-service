import {
  GraphQLFieldConfig,
  GraphQLFieldConfigArgumentMap,
  GraphQLSchema,
  GraphQLObjectType,
  Source,
  GraphQLInt,
} from 'graphql';

import { userMutations, userFields, UserType } from '../lib/user/internalGraphql';
import { findAllUsers } from '../lib/user/userService';

import type { Context } from 'src/types';

/**
 * Funcion totalmente dummy hasta que implementemos la autenticacion.
 * Una vez que tengamos eso vamos a poder tener una idea de cual es el
 * usuario logeado. Hasta entonces devolvemos simplemente el primer
 * usuario de la base.
 */
const getViewer = async (ctx: Context) => {
  const [viewer] = await findAllUsers({});

  ctx.logger.info('Using viewer', viewer);

  return {
    userId: viewer.id,
    githubId: viewer.githubId,
    name: viewer.name,
    lastName: viewer.lastName,
    notificationEmail: viewer.notificationEmail,
    file: viewer.file,
  };
};

const testing: GraphQLFieldConfigArgumentMap = {
  age: {
    type: GraphQLInt,
  },
  name: {
    description: 'testing',
    type: GraphQLInt,
  },
};

const x: GraphQLFieldConfig<Source, Context> = {
  args: testing,
  description: 'Logged in user',
  type: UserType,
  resolve: async (_source, _args, context) => {
    return getViewer(context);
  },
};

const Query: GraphQLObjectType<Source, Context> = new GraphQLObjectType({
  name: 'RootQueryType',
  description: 'Root query',
  fields: {
    viewer: x,
    ...userFields,
  },
});

const Mutation: GraphQLObjectType<Source, Context> = new GraphQLObjectType({
  name: 'RootMutationType',
  description: 'Root mutation',
  fields: {
    ...userMutations,
  },
});

const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default schema;
