import {
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLList,
} from 'graphql';

import { userMutations, userFields } from '../lib/user/internalGraphql';
import { findUser, findAllUsers, findUsersInCourse } from '../lib/user/userService';
import { findAllUserRoles, findUserRoleInCourse } from '../lib/userRole/userRoleService';
import { findCourse } from '../lib/course/courseService';
import { findSubject } from '../lib/subject/subjectService';
import { findRole } from '../lib/role/roleService';

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

const ViewerRoleType: any = new GraphQLObjectType({
  name: 'ViewerRoleType',
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    permissions: { type: new GraphQLList(GraphQLString) },
    active: { type: GraphQLBoolean },
    parent: {
      type: ViewerRoleType,
      resolve: async (source, args, context) => {
        const { logger } = context;
        const { id, parentRoleId } = source;

        logger.info(`Resolving parent role for role ${id}`);

        const parentRole = await findRole({ roleId: parentRoleId });

        return parentRole;
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: 'UserType',
  description: 'UserType',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    lastName: { type: GraphQLString },
    file: { type: GraphQLString },
    active: { type: GraphQLBoolean },
    githubId: { type: GraphQLString },
    notificationEmail: { type: GraphQLString },
  },
});

const ViewerCourseType = new GraphQLObjectType({
  name: 'ViewerCourseType',
  description: 'Courses viewer belongs belongs to',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    organization: { type: new GraphQLNonNull(GraphQLString) },
    period: { type: new GraphQLNonNull(GraphQLInt) },
    year: { type: new GraphQLNonNull(GraphQLInt) },
    active: { type: new GraphQLNonNull(GraphQLBoolean) },
    role: {
      type: new GraphQLNonNull(ViewerRoleType),
      description: 'Role the user has within a course',
      resolve: async (userCourse, _) => {
        const { roleId } = userCourse;

        const role = await findRole({ roleId });
        return role;
      },
    },
    subject: {
      type: new GraphQLNonNull(SubjectType),
      description: 'Subject the course belongs to',
      resolve: async ({ subjectId }) => {
        const subject = await findSubject({ subjectId });
        return subject;
      },
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(UserType)),
      description: 'Users in course',
      resolve: async (course, _, ctx) => {
        const { logger } = ctx;

        logger.info(`Looking for users within course ${course.id}`);

        const users = await findUsersInCourse({ courseId: course.id });
        return users;
      },
    },
  },
});

const ViewerType = new GraphQLObjectType({
  name: 'ViewerType',
  fields: {
    userId: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    file: { type: new GraphQLNonNull(GraphQLString) },
    active: { type: GraphQLBoolean },
    githubId: { type: new GraphQLNonNull(GraphQLString) },
    notificationEmail: { type: new GraphQLNonNull(GraphQLString) },

    findCourse: {
      args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
      description: 'Finds a course for the viewer',
      type: ViewerCourseType,
      resolve: async (viewer, args, context) => {
        context.logger.info('Finding course', { courseId: args.id });

        const course = await findCourse({ courseId: args.id });
        const userRole = await findUserRoleInCourse({
          courseId: args.id,
          userId: viewer.userId,
        });

        return {
          ...course,
          roleId: userRole.roleId,
        };
      },
    },

    // TODO(Tomas): esto tiene que ser una connection.
    courses: {
      type: new GraphQLNonNull(new GraphQLList(ViewerCourseType)),
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
