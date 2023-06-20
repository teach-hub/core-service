import { getGithubToken } from '../tokens/jwt';
import { initOctokit, initOctokitWithGithubToken } from './config';
import { Octokit } from '@octokit/rest';

export const getGithubUserIdFromGithubToken = async (token: string): Promise<string> => {
  const octokit = initOctokitWithGithubToken(token);

  const {
    data: { id },
  } = await octokit.rest.users.getAuthenticated();

  return String(id);
};

export const getGithubUserId = async (jwt: string): Promise<string> => {
  const token = getGithubToken({ token: jwt });
  return getGithubUserIdFromGithubToken(token);
};

export const getGithubUserOrganizationNames = async (jwt: string): Promise<string[]> => {
  const octokit = initOctokit(jwt);

  const response = await octokit.rest.orgs.listForAuthenticatedUser();
  return response.data.map(org => org.login);
};

/**
 * Returns the GitHub username from a GitHub id
 * */
export const getGithubUsernameFromGithubId = async (
  octokit: Octokit,
  githubId: string
): Promise<string> => {
  /* Octokit does not have a method linked to this request */
  const response = await octokit.request('GET /user/:id', {
    id: githubId,
  });
  return response.data.login;
};
