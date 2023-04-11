import { getGithubUserId } from '../github/githubUser';
import { findUserWithGithubId, UserFields } from '../lib/user/userService';
import { isDefinedAndNotEmpty } from './objectUtils';

export const getAuthenticatedUserFromToken = async (
  token: string
): Promise<UserFields | null> => {
  const currentUserGithubId = await getGithubUserId(token);
  const user = await findUserWithGithubId(currentUserGithubId);

  if (isDefinedAndNotEmpty(user)) return user;

  return null;
};
