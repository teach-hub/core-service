import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import { UserFields } from '../lib/user/userService';
import { findAllUserRoles, findUserRoleInCourse } from '../lib/userRole/userRoleService';
import { findCourse } from '../lib/course/courseService';

import { userMutations, UserType } from '../lib/user/internalGraphql';
import { CourseType } from '../lib/course/internalGraphql';
import { RoleType } from '../lib/role/internalGraphql';
import { buildUserRoleType } from '../lib/userRole/internalGraphql';

import { fromGlobalId, toGlobalId } from './utils';

import type { Context } from 'src/types';
import { authMutations } from '../lib/auth/graphql';
import { getToken } from '../requestUtils';
import { getAuthenticatedUserFromToken } from '../utils/userUtils';

const getViewer = async (ctx: Context): Promise<UserFields> => {
  const token = getToken(ctx);
  if (!token) throw new Error('No token provided');

  const viewer = await getAuthenticatedUserFromToken(token);
  if (!viewer) {
    ctx.logger.error(`No user found for token ${token}`);
    throw new Error('Internal server error');
  }

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

const UserRoleType = buildUserRoleType({
  roleType: RoleType,
  userType: UserType,
  courseType: CourseType,
});

const ViewerType: GraphQLObjectType<UserFields, Context> = new GraphQLObjectType({
  name: 'ViewerType',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: s =>
        toGlobalId({
          entityName: 'viewer',
          dbId: String(s.id) as string,
        }),
    },
    name: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    file: { type: new GraphQLNonNull(GraphQLString) },
    active: { type: new GraphQLNonNull(GraphQLBoolean) },
    githubId: { type: new GraphQLNonNull(GraphQLString) },
    notificationEmail: { type: new GraphQLNonNull(GraphQLString) },
    userRoles: {
      type: new GraphQLList(UserRoleType),
      description: 'User user roles',
      resolve: async viewer => {
        return findAllUserRoles({ forUserId: viewer.id });
      },
    },
    findCourse: {
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
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
  },
});

const Mutation: GraphQLObjectType<null, Context> = new GraphQLObjectType({
  name: 'RootMutationType',
  description: 'Root mutation',
  fields: {
    ...userMutations,
    ...authMutations,
  },
});

const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default schema;
