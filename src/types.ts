import { graphqlHTTP } from 'express-graphql';

export { Context } from './context';

export type Request = Parameters<ReturnType<typeof graphqlHTTP>>[0];
export type Response = Parameters<ReturnType<typeof graphqlHTTP>>[1];

export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
