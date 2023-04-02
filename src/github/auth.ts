import { githubOAuthApp } from './config';

export const exchangeCodeForToken = async (code: string): Promise<string> => {
  const { authentication } = await githubOAuthApp.createToken({
    code: code,
  });

  return authentication.token;
};
