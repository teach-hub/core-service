import type { Context, Nullable, Optional } from '../types';

export const getToken = (context: Context): Optional<string> => {
  /*
   * context.request.headers.get raises error as not being a function
   * */
  const authHeader = context.request.headers.authorization;
  return authHeader?.replace('Bearer ', '');
};

export const getBasicCredentials = (context: Context): Nullable<[string, string]> => {
  const authHeader = context.request.headers.authorization as string;

  if (!authHeader) {
    return null;
  }

  const basicAuth = authHeader.replace('Basic ', '');
  const [username, password] = atob(basicAuth).split(':');
  return [username, password];
};

export const buildUnauthorizedError = (): Error => {
  const error = new Error(
    'UNAUTHORIZED_ERROR - User must be authenticated to perform this action'
  );
  error.name = 'UnauthorizedError';
  return error;
};
