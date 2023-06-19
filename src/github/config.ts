import { OAuthApp } from '@octokit/oauth-app';
import { Octokit } from '@octokit/rest';
import { getGithubToken } from '../tokens/jwt';

const clientId: string = process.env.GITHUB_APP_CLIENT_ID || 'fake-id';
const clientSecret: string = process.env.GITHUB_APP_CLIENT_SECRET || 'fake-secret';

export const githubOAuthApp = new OAuthApp({ clientId, clientSecret });

export const initOctokit = (jwt: string) => {
  const token = getGithubToken({ token: jwt });

  return initOctokitWithGithubToken(token);
};

export const initOctokitWithGithubToken = (token: string) => {
  return new Octokit({
    auth: token,
  });
};
