import { githubOAuthApp } from './config';
import logger from '../logger';
import * as OAuthMethods from '@octokit/oauth-methods';

export const exchangeCodeForToken = async (code: string): Promise<string> => {
  const { authentication } = await githubOAuthApp.createToken({ code });

  return authentication.token;
};

/**
 * Returns true if the token was revoked,
 * false otherwise.
 * */
export const revokeToken = async (token: string): Promise<boolean> => {
  try {
    const response: OAuthMethods.DeleteTokenResponse = await githubOAuthApp.deleteToken({
      token: token,
    });
    if (response.status === 204) return true;
  } catch (error) {
    logger.error(error);
  }
  return false;
};
