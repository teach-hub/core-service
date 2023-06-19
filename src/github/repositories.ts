import logger from '../logger';
import { Octokit } from '@octokit/rest';

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

/**
 * Will try to create every repository, with every collaborator,
 * on best effort. If any error raises with any repository
 * or collaborator, it will be logged and the process will continue.
 *
 * A list of failed repositories names will be returned.
 * */
export const createRepositories = ({
  octokit,
  organization,
  repositoriesData,
  adminsGithubUsernames,
  maintainersGithubUsernames,
}: {
  octokit: Octokit;
  organization: string;
  adminsGithubUsernames: string[];
  maintainersGithubUsernames: string[];
  repositoriesData: RepositoryData[];
}) => {
  const failedReposNames: string[] = [];

  /* Admins and collaborators are the same for every repository, map their permissions */
  const adminsCollaboratorData = adminsGithubUsernames.map(username => {
    return {
      username,
      permission: CollaboratorPermission.Admin,
    };
  });

  const maintainersCollaboratorData = maintainersGithubUsernames.map(username => {
    return {
      username,
      permission: CollaboratorPermission.Maintain,
    };
  });

  for (const repositoryData of repositoriesData) {
    const { name, collaborators, isPrivate } = repositoryData;

    const allRepoUsers: CollaboratorData[] = [
      ...adminsCollaboratorData,
      ...maintainersCollaboratorData,
      ...collaborators.map(username => {
        return {
          username,
          permission: CollaboratorPermission.Write,
        };
      }), // Map collaborators to their permissions
    ];

    octokit.rest.repos
      .createInOrg({
        org: organization,
        name,
        private: isPrivate,
      })
      .catch(error => {
        failedReposNames.push(name);
        logger.error(`Error creating repository ${name} in organization ${organization}`);
        logger.error(error);
      })
      .then(createRepositoryResponse => {
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
            .catch(error => {
              failedReposNames.push(name);
              logger.error(
                `Error adding collaborator ${user.username} with permission ${user.permission} in repository ${name} in organization ${organization}`
              );
              logger.error(error);
            })
            .then(addCollaboratorResponse => {
              logger.info(
                `Collaborator ${user.username} with permission ${user.permission} added in repository ${name} from organization ${organization}`
              );
            });
        }
      });
  }

  return failedReposNames;
};
