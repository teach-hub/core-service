import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLFieldConfigArgumentMap,
} from 'graphql';

import type { Context } from 'src/types';

const buildCreateTypeMutation = <T>(
  type: GraphQLOutputType,
  typeName: string,
  mutationArgs: GraphQLFieldConfigArgumentMap,
  createCallback: (args: T) => Promise<T>
): GraphQLFieldConfig<unknown, Context> => ({
  type,
  description: `Creates a new ${typeName}`,
  args: mutationArgs,
  resolve: async (_, { ...rest }, ctx) => {
    ctx.logger.info('Executing mutation create from ' + typeName);

    return createCallback(rest as T);
  },
});

const buildUpdateTypeMutation = <T>(
  type: GraphQLOutputType,
  typeName: string,
  mutationArgs: GraphQLFieldConfigArgumentMap,
  updateCallback: (id: string, args: T) => Promise<T>
): GraphQLFieldConfig<unknown, Context> => {
  return {
    type,
    description: `Updates a ${typeName}`,
    args: mutationArgs,
    resolve: async (_, { id, ...rest }, ctx) => {
      ctx.logger.info('Executing mutation update from ' + typeName);

      return updateCallback(id, rest as T);
    },
  };
};

const buildDeleteTypeMutation = <T>(
  type: GraphQLOutputType,
  typeName: string,
  findCallback: (id: string) => Promise<T>
): GraphQLFieldConfig<unknown, Context> => {
  return {
    type,
    args: { id: { type: new GraphQLNonNull(GraphQLID) } },
    resolve: async (_: unknown, { id }: any, ctx: Context) => {
      ctx.logger.info(`Would delete ${typeName}`, { id });

      return findCallback(id);
    },
  };
};

type MutationsParams<T> = {
  type: GraphQLOutputType;
  keyName: string;
  deleteOptions: {
    findCallback: (id: string) => Promise<T>;
  };
  updateOptions: {
    args: GraphQLFieldConfigArgumentMap;
    callback: (id: string, args: T) => Promise<T>;
  };
  createOptions: {
    args: GraphQLFieldConfigArgumentMap;
    callback: (args: T) => Promise<T>;
  };
};

export function buildEntityMutations<T>({
  type,
  keyName,
  createOptions: { args: createArgs, callback: createCallback },
  updateOptions: { args: updateArgs, callback: updateCallback },
  deleteOptions: { findCallback },
}: MutationsParams<T>): GraphQLFieldConfigMap<unknown, Context> {
  return {
    [`create${keyName}`]: buildCreateTypeMutation<T>(
      type,
      keyName,
      createArgs,
      createCallback
    ),
    [`update${keyName}`]: buildUpdateTypeMutation<T>(
      type,
      keyName,
      updateArgs,
      updateCallback
    ),
    [`delete${keyName}`]: buildDeleteTypeMutation(type, keyName, findCallback),
  };
}
