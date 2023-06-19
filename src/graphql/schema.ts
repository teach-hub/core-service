import {
  GraphQLID,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import { buildUserRoleType } from '../lib/userRole/internalGraphql';
import { UserFields } from '../lib/user/userService';
import { findAllUserRoles, findUserRoleInCourse } from '../lib/userRole/userRoleService';
import { findCourse } from '../lib/course/courseService';
import { findAllRoles } from '../lib/role/roleService';

import { getViewer, userMutations, UserType } from '../lib/user/internalGraphql';
import { inviteMutations } from '../lib/invite/internalGraphql';
import { authMutations } from '../lib/auth/graphql';
import { courseMutations, CourseType } from '../lib/course/internalGraphql';
import { RoleType } from '../lib/role/internalGraphql';

import { fromGlobalId, toGlobalId } from './utils';

import type { Context } from 'src/types';
import { assignmentMutations, AssignmentType } from '../lib/assignment/graphql';
import { findAssignment } from '../lib/assignment/assignmentService';
import { getToken } from '../utils/request';
import { getGithubUserOrganizationNames } from '../github/githubUser';
import { repositoryMutations } from '../lib/repository/internalGraphql';

const UserRoleType = buildUserRoleType({
  roleType: RoleType,
  userType: UserType,
  courseType: CourseType,
});

const ViewerOrganizationsType: GraphQLObjectType<unknown, Context> =
  new GraphQLObjectType({
    name: 'ViewerOrganizations',
    description: 'Viewer organizations data',
    fields: {
      names: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
      },
    },
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
      type: new GraphQLList(new GraphQLNonNull(UserRoleType)),
      description: 'User user roles',
      resolve: async viewer => {
        const response = await findAllUserRoles({ forUserId: viewer.id });

        return response;
      },
    },
    course: {
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
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
    assignment: {
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      description: 'Finds an assignment by id',
      type: AssignmentType,
      resolve: async (_, args, { logger }) => {
        const { dbId: assignmentId } = fromGlobalId(args.id);

        logger.info('Finding assignment', { assignmentId });

        return await findAssignment({ assignmentId });
      },
    },
    availableOrganizations: {
      description: 'Get available github organizations for a user',
      type: ViewerOrganizationsType,
      resolve: async (viewer, args, ctx) => {
        const token = getToken(ctx);
        if (!token) throw new Error('Token required');

        return {
          names: await getGithubUserOrganizationNames(token),
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
    availableRoles: {
      description: 'Logged in user',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RoleType))),
      resolve: async (_source, _args, ctx) => {
        const roles = await findAllRoles({});

        return roles;
      },
    },
  },
});

const Mutation: GraphQLObjectType<null, Context> = new GraphQLObjectType({
  name: 'RootMutationType',
  description: 'Root mutation',
  fields: {
    ...inviteMutations,
    ...userMutations,
    ...authMutations,
    ...assignmentMutations,
    ...courseMutations,
    ...repositoryMutations,
  },
});

const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default schema;
