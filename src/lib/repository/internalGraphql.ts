import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';
import { createRepositories, RepositoryData } from '../../github/repositories';
import { getToken } from '../../utils/request';

import { findUser, findUsersInCourse } from '../user/userService';
import { findCourse } from '../course/courseService';

import { getGithubUsernameFromGithubId } from '../../github/githubUser';
import { initOctokit } from '../../github/config';
import { bulkCreateRepository, RepositoryFields } from './service';

import { UserType } from '../user/internalGraphql';
import { CourseType } from '../course/internalGraphql';

import type { Context } from '../../types';

interface RepositoryStudentsData {
  name: string;
  students: [string];
}

const RepositoryStudentsDataInput = new GraphQLInputObjectType({
  name: 'RepositoryStudentData',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    students: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
  }),
});

export const RepositoryType = new GraphQLObjectType({
  name: 'RepositoryType',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s => {
        return toGlobalId({
          entityName: 'repository',
          dbId: String(s.id),
        });
      },
    },
    course: {
      type: new GraphQLNonNull(CourseType),
      resolve: async repository => {
        return findCourse({ courseId: repository.courseId });
      },
    },
    user: {
      type: new GraphQLNonNull(UserType),
      resolve: async repository => {
        return findUser({ userId: repository.userId });
      },
    },
    githubId: {
      type: new GraphQLNonNull(GraphQLString),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    active: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
  },
});

export const repositoryMutations = {
  createRepositories: {
    name: 'CreateRepositories',
    type: new GraphQLObjectType({
      name: 'CreateRepositoriesResponse',
      fields: {
        failedRepositoriesNames: {
          type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
        },
      },
    }),
    description: 'Creates repositories',
    args: {
      organization: {
        type: new GraphQLNonNull(GraphQLString),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      names: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
      admins: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
      maintainers: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
      arePrivate: { type: GraphQLBoolean },
      repositoriesData: {
        type: new GraphQLList(new GraphQLNonNull(RepositoryStudentsDataInput)),
      },
    },

    // FIXME. No copiar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve: async (_: unknown, args: any, context: Context) => {
      const token = getToken(context);
      if (!token) throw new Error('Token required');

      const {
        organization: organization,
        courseId: encodedCourseId,
        admins: admins,
        maintainers: maintainers,
        repositoriesData: repositoriesStudentsData,
        arePrivate: arePrivate,
      } = args;

      const courseId = fromGlobalIdAsNumber(encodedCourseId);

      context.logger.info(`Creating repositories with data ${JSON.stringify(args)}`);

      /* Fetch every user in the course, to later create their repositories */
      const courseUsers = await findUsersInCourse({ courseId: courseId });

      /* Initialize client that will be continuously used */
      const octokit = initOctokit(token);

      /* Transform our id to the GitHub username, required for repository creation */
      const fetchGithubUsername = async (globalUserId: string) => {
        const userId = fromGlobalIdAsNumber(globalUserId);
        const user = courseUsers.find(user => user.id === userId); // Match by id
        if (!user) throw new Error(`User with id ${userId} not found in course`);

        try {
          return await getGithubUsernameFromGithubId(octokit, user.githubId || '');
        } catch (e) {
          context.logger.error(e);
          throw e;
        }
      };

      const fetchListGithubUsernames = async (globalIdList: string[]) =>
        await Promise.all(globalIdList.map(fetchGithubUsername));

      /* Fetch admins and maintainers only one time, for every repo will be the same */
      const adminsGithubUsernames = await fetchListGithubUsernames(admins);
      const maintainersGithubUsernames = await fetchListGithubUsernames(maintainers);

      const repositoriesData: RepositoryData[] = await Promise.all(
        repositoriesStudentsData.map(async (data: RepositoryStudentsData) => {
          return {
            name: data.name,
            collaborators: await fetchListGithubUsernames(data.students),
            isPrivate: arePrivate,
          };
        })
      );

      const createRepositoriesResult = await createRepositories({
        octokit,
        organization,
        repositoriesData,
        adminsGithubUsernames,
        maintainersGithubUsernames,
      });

      const repositoryFieldList: RepositoryFields[] =
        createRepositoriesResult.createdRepositoriesData
          .map(repositoryData => {
            // Recover user id from the first student in the list
            const student = repositoriesStudentsData.find(
              (data: RepositoryStudentsData) => data.name === repositoryData.name
            );
            const userId = student
              ? fromGlobalIdAsNumber(student.students[0] || '')
              : undefined;

            return {
              courseId,
              userId,
              groupId: undefined, // todo: TH-129 Create group repositories
              name: repositoryData.name,
              githubId: repositoryData.id,
              active: true,
              id: undefined,
            };
          })
          .filter(repositoryField => repositoryField.userId !== undefined);

      await bulkCreateRepository(repositoryFieldList);

      return {
        failedRepositoriesNames: createRepositoriesResult.failedRepositoriesData.map(
          x => x.name
        ),
      };
    },
  },
};
