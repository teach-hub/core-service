import { Context } from '../../types';
import { fromGlobalIdAsNumber } from '../../graphql/utils';
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { createRepositories, RepositoryData } from '../../github/repositories';
import { getToken } from '../../utils/request';
import { findUsersInCourse } from '../user/userService';
import { getGithubUsernameFromGithubId } from '../../github/githubUser';
import logger from '../../logger';
import { initOctokit } from '../../github/config';
import { bulkCreateRepository, RepositoryFields } from './repositoryService';

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

export const repositoryMutations = {
  createRepositories: {
    name: 'CreateRepositories',
    type: new GraphQLObjectType({
      name: 'CreateRepositoriesResponse',
      fields: {
        failedRepositoriesNames: {
          type: GraphQLList(new GraphQLNonNull(GraphQLString)),
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
          logger.error(e);
          throw e;
        }
      };

      const fetchListGithubUsernames = async (globalIdList: string[]) =>
        await Promise.all(
          globalIdList.map(async (globalUserId: string) => {
            return await fetchGithubUsername(globalUserId);
          })
        );

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
