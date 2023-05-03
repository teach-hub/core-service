import { Octokit } from '@octokit/rest';
import { getGithubToken } from '../tokens/jwt';

export const getGithubUserIdFromGithubToken = async (token: string): Promise<string> => {
  const octokit = new Octokit({
    auth: token,
  });

  const {
    data: { id },
  } = await octokit.rest.users.getAuthenticated();

  return String(id);
};
export const getGithubUserId = async (jwt: string): Promise<string> => {
  const token = getGithubToken({ token: jwt });
  return getGithubUserIdFromGithubToken(token);
};
