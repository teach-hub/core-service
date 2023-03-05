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
import { findAllUsers } from '../lib/user/userService';
import { findAllUserRoles } from '../lib/userRole/userRoleService';
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

const ViewerCourseType = new GraphQLObjectType({
  name: 'ViewerCourseType',
  description: 'Courses belonging to viewer',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    organization: { type: new GraphQLNonNull(GraphQLString) },
    period: { type: new GraphQLNonNull(GraphQLInt) },
    year: { type: new GraphQLNonNull(GraphQLInt) },
    active: { type: new GraphQLNonNull(GraphQLBoolean) },
    role: {
      type: new GraphQLNonNull(ViewerRoleType),
      description: 'Role that user has within a course',
      resolve: async (userCourse, _, context) => {
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
