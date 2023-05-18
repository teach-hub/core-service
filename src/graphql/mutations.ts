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
  createFields: GraphQLFieldConfigArgumentMap;
  updateFields: GraphQLFieldConfigArgumentMap;
  createCallback: (args: T) => Promise<T>;
  updateCallback: (id: string, args: T) => Promise<T>;
  findCallback: (id: string) => Promise<T>;
};

export function buildEntityMutations<T>({
  type,
  keyName,
  createFields,
  updateFields,
  createCallback,
  updateCallback,
  findCallback,
}: MutationsParams<T>): GraphQLFieldConfigMap<unknown, Context> {
  return {
    [`create${keyName}`]: buildCreateTypeMutation<T>(
      type,
      keyName,
      createFields,
      createCallback
    ),
    [`update${keyName}`]: buildUpdateTypeMutation<T>(
      type,
      keyName,
      updateFields,
      updateCallback
    ),
    [`delete${keyName}`]: buildDeleteTypeMutation<T>(type, keyName, findCallback),
  };
}
