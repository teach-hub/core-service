import { Context, Optional } from './types';

export const getToken = (context: Context): Optional<string> => {
  /*
   * context.request.headers.get raises error as not being a function
   * */
  const headerEntries = Object.entries(context.request.headers);
  const headersJSON = Object.fromEntries(headerEntries);
  const authHeader = headersJSON['authorization'];
  return authHeader?.replace('Bearer ', '');
};
