import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';
import {
  createRepositories,
  GithubCreatedRepositoryData,
  RepositoryData,
} from '../../github/repositories';
import { getToken } from '../../utils/request';

import { findUser, findUsersInCourse } from '../user/userService';
import { findCourse } from '../course/courseService';

import { getGithubUsernameFromGithubId } from '../../github/githubUser';
import { initOctokit } from '../../github/config';
import { bulkCreateRepository, RepositoryFields } from './service';

import { UserType } from '../user/internalGraphql';
import { CourseType } from '../course/internalGraphql';

import type { AuthenticatedContext } from 'src/context';

interface RepositoryStudentsData {
  name: string;
  students: [number];
  groupId: number;
}

type RepositoryStudentsInputData = {
  name: string;
  students: [string];
  groupId: string;
};

const RepositoryStudentsDataInput = new GraphQLInputObjectType({
  name: 'RepositoryStudentData',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    students: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    groupId: { type: GraphQLString },
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
          dbId: s.id,
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

export const repositoryMutations: GraphQLFieldConfigMap<null, AuthenticatedContext> = {
  createRepositories: {
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
    resolve: async (_, args, context) => {
      const token = getToken(context);
      if (!token) throw new Error('Token required');

      const {
        organization: organization,
        courseId: encodedCourseId,
        admins: globalIdAdmins,
        maintainers: maintainerGlobalIds,
        repositoriesData: repositoriesDataWithGlobalIds,
        arePrivate: arePrivate,
      } = args;

      /**
       * Transform all received data containing global ids
       * into real database ids
       * */
      const courseId = fromGlobalIdAsNumber(encodedCourseId);

      const admins = globalIdAdmins.map((id: string) => fromGlobalIdAsNumber(id));
      const maintainers = maintainerGlobalIds.map((id: string) =>
        fromGlobalIdAsNumber(id)
      );

      const repositoriesData: RepositoryStudentsData[] =
        repositoriesDataWithGlobalIds.map((data: RepositoryStudentsInputData) => {
          const students = data.students.map((id: string) => fromGlobalIdAsNumber(id));

          const groupId = data.groupId ? fromGlobalIdAsNumber(data.groupId) : null;

          return {
            ...data,
            students,
            groupId,
          };
        });

      context.logger.info(`Creating repositories with data ${JSON.stringify(args)}`);

      /* Fetch every user in the course, to later create their repositories */
      const courseUsers = await findUsersInCourse({ courseId: courseId });

      /* Initialize client that will be continuously used */
      const octokit = initOctokit(token);

      /* Transform our id to the GitHub username, required for repository creation */
      const fetchGithubUsername = async (userId: number) => {
        const user = courseUsers.find(user => user.id === userId); // Match by id
        if (!user) throw new Error(`User with id ${userId} not found in course`);

        try {
          return await getGithubUsernameFromGithubId(octokit, user.githubId || '');
        } catch (e) {
          context.logger.error(e);
          throw e;
        }
      };

      const fetchListGithubUsernames = async (userIdList: number[]) =>
        await Promise.all(userIdList.map(fetchGithubUsername));

      /* Fetch admins and maintainers only one time, for every repo will be the same */
      const adminsGithubUsernames = await fetchListGithubUsernames(admins);
      const maintainersGithubUsernames = await fetchListGithubUsernames(maintainers);

      const githubRepositoryData: RepositoryData[] = await Promise.all(
        repositoriesData.map(async (data: RepositoryStudentsData) => {
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
        repositoriesData: githubRepositoryData,
        adminsGithubUsernames,
        maintainersGithubUsernames,
      });

      const repositoryFieldList: RepositoryFields[] =
        createRepositoriesResult.createdRepositoriesData
          .map(createdRepositoryData => {
            return buildRepositoryFields({
              createdRepositoryData,
              courseId,
              repositoriesData,
            });
          })
          .filter(
            repositoryField =>
              repositoryField.userId !== undefined ||
              repositoryField.groupId !== undefined
          );

      try {
        await bulkCreateRepository(repositoryFieldList);
      } catch (e) {
        context.logger.error(e);
      }

      return {
        failedRepositoriesNames: createRepositoriesResult.failedRepositoriesData.map(
          x => x.name
        ),
      };
    },
  },
};

const buildRepositoryFields = ({
  createdRepositoryData,
  repositoriesData,
  courseId,
}: {
  createdRepositoryData: GithubCreatedRepositoryData;
  repositoriesData: RepositoryStudentsData[];
  courseId: number;
}): RepositoryFields => {
  // Recover repository data from  matching repository name
  const currentData = repositoriesData.find(
    (data: RepositoryStudentsData) => data.name === createdRepositoryData.name
  );

  if (!currentData)
    throw new Error(
      `Internal error: repository data not found for repository ${createdRepositoryData.name}`
    );

  /**
   * If group is set then ignore userId, as the repository
   * must be linked to the group instead of just a user.
   * Otherwise, if there is no group, then the repository
   * will be linked to just one student, so the first item
   * of the students lists is used as the userId
   * */
  const userId = currentData.groupId ? undefined : currentData.students[0];

  return {
    courseId,
    userId: userId,
    groupId: currentData.groupId,
    name: createdRepositoryData.name,
    githubId: createdRepositoryData.id,
    active: true,
    id: undefined,
  };
};
