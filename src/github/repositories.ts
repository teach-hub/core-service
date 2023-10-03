import logger from '../logger';
import { Octokit } from '@octokit/rest';

export interface BaseRepositoryData {
  name: string;
  includeAllBranches: boolean;
}

export interface RepositoryData {
  name: string;
  collaborators: string[];
  isPrivate: boolean;
}

enum CollaboratorPermission {
  Admin = 'admin',
  Maintain = 'maintain',
  Write = 'write',
}

interface CollaboratorData {
  username: string;
  permission: string;
}

export interface GithubCreatedRepositoryData {
  name: string;
  id: number;
}

export interface GithubFailedRepositoryData {
  name: string;
}

interface CreateRepositoriesResult {
  failedRepositoriesData: GithubFailedRepositoryData[];
  createdRepositoriesData: GithubCreatedRepositoryData[];
}

/**
 * Will try to create every repository, with every collaborator,
 * on best effort. If any error raises with any repository
 * or collaborator, it will be logged and the process will continue.
 *
 * A list of failed repositories names will be returned.
 * */
export const createRepositories = async ({
  octokit,
  organization,
  repositoriesData,
  adminsGithubUsernames,
  maintainersGithubUsernames,
  baseRepositoryData,
}: {
  octokit: Octokit;
  organization: string;
  adminsGithubUsernames: string[];
  maintainersGithubUsernames: string[];
  repositoriesData: RepositoryData[];
  baseRepositoryData?: BaseRepositoryData;
}): Promise<CreateRepositoriesResult> => {
  /* Admins and collaborators are the same for every repository, map their permissions */
  const adminsCollaboratorData = adminsGithubUsernames.map(username => ({
    username,
    permission: CollaboratorPermission.Admin,
  }));

  const maintainersCollaboratorData = maintainersGithubUsernames.map(username => ({
    username,
    permission: CollaboratorPermission.Maintain,
  }));

  const handleRepositoryError = (
    name: string,
    errorMessage: string,
    error: unknown
  ): GithubFailedRepositoryData => {
    logger.error(errorMessage);
    logger.error(error);
    return { name };
  };

  const createRepoPromises: Promise<
    GithubCreatedRepositoryData | GithubFailedRepositoryData
  >[] = repositoriesData.map(
    async (
      repositoryData: RepositoryData
    ): Promise<GithubCreatedRepositoryData | GithubFailedRepositoryData> => {
      const { name, collaborators, isPrivate } = repositoryData;

      const allRepoUsers: CollaboratorData[] = [
        ...adminsCollaboratorData,
        ...maintainersCollaboratorData,
        ...collaborators.map(username => ({
          username,
          permission: CollaboratorPermission.Write,
        })), // Map collaborators to their permissions
      ];

      const hasBaseRepo = !!baseRepositoryData;

      const createRepositoryInGithub = async () => {
        if (!hasBaseRepo) {
          return octokit.rest.repos.createInOrg({
            org: organization,
            name,
            private: isPrivate,
          });
        } else {
          return octokit.rest.repos.createUsingTemplate({
            name,
            owner: organization,
            private: isPrivate,
            template_owner: organization,
            template_repo: baseRepositoryData.name,
            include_all_branches: baseRepositoryData.includeAllBranches,
          });
        }
      };

      try {
        return await createRepositoryInGithub().then(createRepositoryResponse => {
          logger.info(`Repository ${name} created in organization ${organization}`);

          /* Add every repo collaborator */
          for (const user of allRepoUsers) {
            octokit.rest.repos
              .addCollaborator({
                owner: organization,
                repo: name,
                permission: user.permission,
                username: user.username,
              })
              .then(_ => {
                logger.info(
                  `Collaborator ${user.username} with permission ${user.permission} added in repository ${name} from organization ${organization}`
                );
              })
              .catch(error => {
                logger.error(
                  `Error adding collaborator ${user.username} with permission ${user.permission} in repository ${name} in organization ${organization}`
                );
                logger.error(error);
              });
          }

          if (
            !createRepositoryResponse?.data?.name ||
            !createRepositoryResponse?.data?.id
          ) {
            return handleRepositoryError(
              name,
              `Error creating repository ${name} in organization ${organization}, response data is not valid`,
              undefined
            );
          }

          return {
            name: createRepositoryResponse.data.name,
            id: createRepositoryResponse.data.id,
          };
        });
      } catch (error) {
        return handleRepositoryError(
          name,
          `Error creating repository ${name} in organization ${organization}`,
          error
        );
      }
    }
  );

  const results = await Promise.all(createRepoPromises);
  const createdRepositoriesData: GithubCreatedRepositoryData[] = results.filter(
    (result): result is GithubCreatedRepositoryData =>
      Object.prototype.hasOwnProperty.call(result, 'id')
  );
  const failedRepositoriesData: GithubFailedRepositoryData[] = results.filter(
    (result): result is GithubFailedRepositoryData =>
      !Object.prototype.hasOwnProperty.call(result, 'id')
  );

  return {
    createdRepositoriesData,
    failedRepositoriesData,
  };
};
