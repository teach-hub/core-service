import { Context, Optional } from '../types';

export const getToken = (context: Context): Optional<string> => {
  /*
   * context.request.headers.get raises error as not being a function
   * */
  const authHeader = context.request.headers.authorization;
  return authHeader?.replace('Bearer ', '');
};
