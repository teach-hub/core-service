import {
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLObjectType,
  Source,
  GraphQLList,
} from 'graphql';

import { userMutations, userFields, UserType } from '../lib/user/internalGraphql';
import { findAllUsers } from '../lib/user/userService';
import { SubjectType } from '../lib/subject/graphql';

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

const ViewerType = new GraphQLObjectType({
  name: 'ViewerType',
  fields: {
    userInfo: {
      description: 'User related information from viewer',
      type: new GraphQLNonNull(UserType),
      resolve: getViewer,
    },

    // TODO(Tomas): esto tiene que ser una connection.
    subjects: {
      description: 'Subjects belonging to viewer',
      type: new GraphQLNonNull(new GraphQLList(SubjectType)),
      resolve: () => [],
    },
  },
});

const Query: GraphQLObjectType<null, Context> = new GraphQLObjectType({
  name: 'RootQueryType',
  description: 'Root query',
  fields: {
    viewer: {
      description: 'Logged in user',
      type: ViewerType,
      resolve: async (_source, _args, ctx) => getViewer(ctx),
    },
    ...userFields,
  },
});

const Mutation: GraphQLObjectType<null, Context> = new GraphQLObjectType({
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
