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
import { findAllRepositories } from '../lib/repository/service';

import { getViewer, userMutations, UserType } from '../lib/user/internalGraphql';
import { inviteMutations } from '../lib/invite/internalGraphql';
import { authMutations } from '../lib/auth/graphql';
import {
  courseMutations,
  CoursePublicDataType,
  CourseType,
} from '../lib/course/internalGraphql';
import { RoleType } from '../lib/role/internalGraphql';
import { repositoryMutations, RepositoryType } from '../lib/repository/internalGraphql';
import { assignmentMutations } from '../lib/assignment/graphql';
import { submissionMutations } from '../lib/submission/internalGraphql';

import { fromGlobalId, fromGlobalIdAsNumber, toGlobalId } from './utils';

import { getToken } from '../utils/request';

import {
  getGithubUsernameFromGithubId,
  getGithubUserOrganizationNames,
} from '../github/githubUser';
import { listOpenPRs } from '../github/pullrequests';
import { initOctokit } from '../github/config';

import { UserPullRequestType } from '../github/graphql';

import type { Context } from 'src/types';
import { groupParticipantMutations } from '../lib/groupParticipant/internalGraphql';
import { reviewMutations } from '../lib/review/internalGraphql';
import InviteModel from '../lib/invite/model';

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
          dbId: String(s.id),
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
          type: new GraphQLNonNull(GraphQLID),
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
          return listOpenPRs(viewer, fromGlobalId(courseId).dbId, client);
        } catch (error) {
          context.logger.error('Error while fetching open pull requests', { error });
          return [];
        }
      },
    },
    repositories: {
      description: 'Look for all the repositories associated to the viewer',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RepositoryType))),
      args: {
        courseId: {
          type: GraphQLID,
          description: 'Scope repositories down to this course',
        },
      },
      resolve: async (viewer, { courseId }, context) => {
        if (!viewer.id) {
          return [];
        }

        try {
          const repositoriesFilters = {
            forUserId: String(viewer.id),
            ...(courseId ? { forCourseId: fromGlobalId(courseId).dbId } : {}),
          };

          context.logger.info('Searching repositories', { filters: repositoriesFilters });

          const result = await findAllRepositories(repositoriesFilters);

          context.logger.info(`Returning ${result.length} repositories`);

          return result;
        } catch (e) {
          context.logger.error('Failed fetching repositories', { error: e });
          return [];
        }
      },
    },
    userRoles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserRoleType))),
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
      type: new GraphQLNonNull(ViewerOrganizationsType),
      resolve: async (_, args, ctx) => {
        const token = getToken(ctx);
        if (!token) throw new Error('Token required');

        return {
          names: await getGithubUserOrganizationNames(token),
        };
      },
    },
    githubUserName: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: async (viewer, _, ctx) => {
        const token = getToken(ctx);
        if (!token) throw new Error('Token required');
        if (!viewer.githubId) throw new Error('User missing githubId');

        return getGithubUsernameFromGithubId(initOctokit(token), viewer.githubId);
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
      resolve: async () => {
        const roles = await findAllRoles({});

        return roles;
      },
    },
    courseOfInvite: {
      description: 'Course of an invite',
      type: CoursePublicDataType, // Set nullable to avoid 500 error if error raises
      args: {
        inviteId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_source, args, _) => {
        const { inviteId: encodedInviteId } = args;
        const inviteId = fromGlobalIdAsNumber(encodedInviteId);
        const invite = await InviteModel.findOne({ where: { id: inviteId } });

        if (!invite) {
          throw new Error('Invite not found');
        }

        const course = await findCourse({ courseId: String(invite.courseId) });
        if (!course) {
          throw new Error('Course not found');
        }
        return course;
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
    ...submissionMutations,
    ...courseMutations,
    ...repositoryMutations,
    ...groupParticipantMutations,
    ...reviewMutations,
  },
});

const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

export default schema;
