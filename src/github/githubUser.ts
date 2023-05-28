import { Octokit } from '@octokit/rest';
import { getGithubToken } from '../tokens/jwt';

export const getGithubUserIdFromGithubToken = async (token: string): Promise<string> => {
  const octokit = initOctokit(token);

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
  const token = getGithubToken({ token: jwt });
  const octokit = initOctokit(token);

  const response = await octokit.rest.orgs.listForAuthenticatedUser();
  return response.data.map(org => org.login);
};

const initOctokit = (token: string) => {
  return new Octokit({
    auth: token,
  });
};
