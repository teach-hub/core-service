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
import { buildUnauthorizedError } from '../utils/request';
import { isContextAuthenticated } from '../context';

import type { OrderingOptions } from 'src/utils';
import type { Context } from 'src/context';

const buildFindTypeObject = <T>(
  type: GraphQLOutputType,
  findCallback: (id: number) => Promise<T | null>
): GraphQLFieldConfig<unknown, Context> => {
  return {
    type,
    args: { id: { type: GraphQLID } },
    // FIXME. No copiar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve: async (_: unknown, { id }: any, context: Context) => {
      if (!isContextAuthenticated(context)) {
        throw buildUnauthorizedError();
      }

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
      { page, perPage, sortField, sortOrder }: OrderingOptions,
      context: Context
    ) => {
      if (!isContextAuthenticated(context)) {
        throw buildUnauthorizedError();
      }

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
    resolve: async (_, __, context: Context) => {
      if (!isContextAuthenticated(context)) {
        throw buildUnauthorizedError();
      }

      return countCallback().then(count => ({ count }));
    },
  };
};

type FieldParams<T> = {
  type: GraphQLOutputType;
  keyName: string;
  countCallback: () => Promise<number>;
  findCallback: (id: number) => Promise<T | null>;
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
