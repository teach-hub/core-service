import { OAuthApp } from '@octokit/oauth-app';

const clientId: string = process.env.GITHUB_APP_CLIENT_ID || 'fake-id';
const clientSecret: string = process.env.GITHUB_APP_CLIENT_SECRET || 'fake-secret';

export const githubOAuthApp = new OAuthApp({ clientId, clientSecret });
