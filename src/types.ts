import type { Logger } from './logger';

export type Context = {
  logger: Logger;
  request: Request;
  response: Response;
};

export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
