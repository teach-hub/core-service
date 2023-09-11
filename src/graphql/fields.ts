import {
  GraphQLOutputType,
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
} from 'graphql';

import { RAArgs } from '../graphql/utils';

import type { OrderingOptions } from 'src/utils';
import type { Context } from 'src/types';

const buildFindTypeObject = <T>(
  type: GraphQLOutputType,
  findCallback: (id: number) => Promise<T>
): GraphQLFieldConfig<unknown, Context> => {
  return {
    type,
    args: { id: { type: GraphQLID } },
    // FIXME. No copiar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve: async (_: unknown, { id }: any) => {
      return findCallback(id);
    },
  };
};

const buildFindAllTypeObject = <T>(
  type: GraphQLOutputType,
  typeName: string,
  findAllCallback: (args: OrderingOptions) => Promise<T[]>
): GraphQLFieldConfig<unknown, Context> => {
  return {
    type: new GraphQLList(type),
    description: `List of ${typeName} on the whole application`,
    args: RAArgs,
    resolve: async (
      _: unknown,
      { page, perPage, sortField, sortOrder }: OrderingOptions
    ) => {
      return findAllCallback({ page, perPage, sortField, sortOrder });
    },
  };
};

const buildMetaTypeObject = (
  keyName: string,
  countCallback: () => Promise<number>
): GraphQLFieldConfig<unknown, Context> => {
  return {
    type: new GraphQLObjectType({
      name: `${keyName}ListMetadata`,
      fields: {
        count: { type: GraphQLInt },
      },
    }),
    args: RAArgs,
    resolve: async () => {
      return countCallback().then(count => ({ count }));
    },
  };
};

type FieldParams<T> = {
  type: GraphQLOutputType;
  keyName: string;
  countCallback: () => Promise<number>;
  findCallback: (id: number) => Promise<T>;
  findAllCallback: (args: OrderingOptions) => Promise<T[]>;
};

export const buildEntityFields = <T>({
  type,
  keyName,
  countCallback,
  findCallback,
  findAllCallback,
}: FieldParams<T>): GraphQLFieldConfigMap<unknown, Context> => {
  return {
    [keyName]: buildFindTypeObject<T>(type, findCallback),
    [`all${keyName}s`]: buildFindAllTypeObject<T>(type, keyName, findAllCallback),
    [`_all${keyName}sMeta`]: buildMetaTypeObject(keyName, countCallback),
  };
};
