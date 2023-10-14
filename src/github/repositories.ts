import logger from '../logger';
import { Octokit } from '@octokit/rest';

type CommitData = Awaited<
  ReturnType<Octokit['rest']['repos']['listCommits']>
>['data'][number];

export type CommitInfo = {
  date: NonNullable<NonNullable<CommitData['commit']['committer']>['date']>;
  authorGithubId: NonNullable<CommitData['author']>['id'];
};

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

export enum RepositoryCreationStatus {
  Created = 'Created',
  FailedOnCreate = 'FailedOnCreate',
  CreatedFailedAddingCollaborator = 'CreatedFailedAddingCollaborator',
}

export type GithubRepositoryCreationResult = {
  name: string;
  status: RepositoryCreationStatus;
  failedCollaborators?: string[];
};

export type GithubRepositorySuccessfulCreationResult = GithubRepositoryCreationResult & {
  id: number;
  name: string;
  status: RepositoryCreationStatus;
  failedCollaborators?: string[];
};

export interface GithubCreatedRepositoryData {
  name: string;
  id: number;
}

interface CreateRepositoriesResult {
  successful: GithubRepositorySuccessfulCreationResult[];
  failedAddingCollaborator: GithubRepositorySuccessfulCreationResult[];
  failed: GithubRepositoryCreationResult[];
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

  const logRepositoryError = (errorMessage: string, error: unknown) => {
    logger.error(errorMessage);
    logger.error(error);
  };

  const createRepoPromises: Promise<GithubRepositoryCreationResult>[] =
    repositoriesData.map(
      async (repositoryData: RepositoryData): Promise<GithubRepositoryCreationResult> => {
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

            const repositoryName = createRepositoryResponse?.data?.name;
            const repositoryId = createRepositoryResponse?.data?.id;

            if (!repositoryName || !repositoryId) {
              logRepositoryError(
                `Error creating repository ${name} in organization ${organization}, response data is not valid`,
                undefined
              );
              return {
                name,
                id: undefined,
                status: RepositoryCreationStatus.FailedOnCreate,
              };
            }

            /* Add every repo collaborator */
            const failedCollaborators: string[] = [];
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
                  failedCollaborators.push(user.username);
                  logger.error(
                    `Error adding collaborator ${user.username} with permission ${user.permission} in repository ${name} in organization ${organization}`
                  );
                  logger.error(error);
                });
            }

            return {
              name: repositoryName,
              id: repositoryId,
              status: failedCollaborators.length
                ? RepositoryCreationStatus.CreatedFailedAddingCollaborator
                : RepositoryCreationStatus.Created,
              failedCollaborators: failedCollaborators,
            };
          });
        } catch (error) {
          logRepositoryError(
            `Error creating repository ${name} in organization ${organization}`,
            error
          );
          return {
            name,
            status: RepositoryCreationStatus.FailedOnCreate,
          };
        }
      }
    );

  const results = await Promise.all(createRepoPromises);
  return {
    successful: results.filter(
      r => r.status === RepositoryCreationStatus.Created
    ) as GithubRepositorySuccessfulCreationResult[],
    failedAddingCollaborator: results.filter(
      r => r.status === RepositoryCreationStatus.CreatedFailedAddingCollaborator
    ) as GithubRepositorySuccessfulCreationResult[],
    failed: results.filter(r => r.status === RepositoryCreationStatus.FailedOnCreate),
  };
};

export const listCommits = async (
  { rest: { repos }, paginate }: Octokit,
  organization: string,
  repository: string
): Promise<CommitInfo[]> => {
  return paginate(repos.listCommits, {
    owner: organization,
    repo: repository,
    per_page: 100,
  }).then(items =>
    items
      .map(({ author, commit }) => ({
        authorGithubId: author?.id,
        date: commit.author?.date,
      }))
      .filter(
        (payload): payload is { authorGithubId: number; date: string } =>
          !!payload.authorGithubId && !!payload.date
      )
  );
};
