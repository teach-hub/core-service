import {
  GraphQLBoolean,
  GraphQLID,
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
import { repositoryMutations } from '../lib/repository/internalGraphql';
import { assignmentMutations } from '../lib/assignment/graphql';

import { fromGlobalId, toGlobalId } from './utils';

import { getToken } from '../utils/request';

import { getGithubUserOrganizationNames } from '../github/githubUser';
import { listOpenPRs } from '../github/pullrequests';
import { initOctokit } from '../github/config';

import { UserPullRequestType } from '../github/graphql';

import type { Context } from 'src/types';

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
    openPullRequests: {
      args: {
        courseId: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserPullRequestType))),
      resolve: async (viewer, { courseId }, context) => {
        try {
          const githubToken = getToken(context);
          if (!githubToken) {
            throw new Error('Github token not found!');
          }

          const client = initOctokit(githubToken);
          return listOpenPRs(viewer, courseId, client);
        } catch (error) {
          context.logger.error('Error while fetching open pull requests', { error });
          return [];
        }
      },
    },
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
    availableOrganizations: {
      description: 'Get available github organizations for a user',
      type: ViewerOrganizationsType,
      resolve: async (_, args, ctx) => {
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
