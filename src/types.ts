import type { Logger } from './logger';

import { graphqlHTTP } from 'express-graphql';

type Request = Parameters<ReturnType<typeof graphqlHTTP>>[0];
type Response = Parameters<ReturnType<typeof graphqlHTTP>>[1];

export type Context = {
  logger: Logger;
  request: Request;
  response: Response;
};

export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
