import {
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLList,
} from 'graphql';

import { UserFields, findAllUsers } from '../lib/user/userService';
import { findAllUserRoles, findUserRoleInCourse } from '../lib/userRole/userRoleService';
import { findCourse } from '../lib/course/courseService';

import { userMutations } from '../lib/user/internalGraphql';
import { CourseType, CourseSummaryType } from '../lib/course/internalGraphql';

import { toGlobalId, fromGlobalId } from './utils';

import type { Context } from 'src/types';

/**
 * Funcion totalmente dummy hasta que implementemos la autenticacion.
 * Una vez que tengamos eso vamos a poder tener una idea de cual es el
 * usuario logeado. Hasta entonces devolvemos simplemente el primer
 * usuario de la base.
 */
const getViewer = async (ctx: Context): Promise<UserFields> => {
  const [viewer] = await findAllUsers({});

  ctx.logger.info('Using viewer', viewer);

  return {
    id: viewer.id,
    githubId: viewer.githubId,
    name: viewer.name,
    lastName: viewer.lastName,
    notificationEmail: viewer.notificationEmail,
    file: viewer.file,
    active: viewer.active,
  };
};

const ViewerType: GraphQLObjectType<UserFields, Context> = new GraphQLObjectType({
  name: 'ViewerType',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: s => {
        return toGlobalId({
          entityName: 'viewer',
          dbId: String(s.id) as string,
        });
      },
    },
    name: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    file: { type: new GraphQLNonNull(GraphQLString) },
    active: { type: new GraphQLNonNull(GraphQLBoolean) },
    githubId: { type: new GraphQLNonNull(GraphQLString) },
    notificationEmail: { type: new GraphQLNonNull(GraphQLString) },
    findCourse: {
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      description: 'Finds a course for the viewer',
      type: CourseType,
      resolve: async (viewer, args, { logger }) => {
        const { dbId: courseId } = fromGlobalId(args.id);

        logger.info('Finding course', { courseId });

        const course = await findCourse({ courseId });
        const userRole = await findUserRoleInCourse({
          courseId: Number(courseId),
          userId: viewer.id as number,
        });

        return {
          ...course,
          roleId: userRole.roleId,
        };
      },
    },
    courses: {
      type: new GraphQLNonNull(new GraphQLList(CourseSummaryType)),
      resolve: async viewer => {
        const userRoles = await findAllUserRoles({ forUserId: viewer.userId });

        return Promise.all(
          userRoles.map(async userRole => {
            // @ts-expect-error: TODO. Mejorar tema de tipos con modelos. Esto no es opcional.
            const course = await findCourse({ courseId: userRole.courseId });

            return {
              ...course,
              roleId: userRole.roleId,
            };
          })
        );
      },
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
      resolve: async (_source, _args, ctx) => {
        const viewer = await getViewer(ctx);

        return viewer;
      },
    },
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
