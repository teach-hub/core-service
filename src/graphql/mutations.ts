import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLFieldConfigArgumentMap,
} from 'graphql';

import type { Context } from 'src/types';

type CreateMutationOptions<T> = {
  args: GraphQLFieldConfigArgumentMap;
  callback: (args: T) => Promise<T>;
};

type UpdateMutationOptions<T> = {
  args: GraphQLFieldConfigArgumentMap;
  callback: (id: number, args: T) => Promise<T>;
};

type DeleteOptions<T> = {
  findCallback: (id: number) => Promise<T>;
};

type MutationsParams<T> = {
  entityName: string;
  entityGraphQLType: GraphQLOutputType;
  createOptions: CreateMutationOptions<T>;
  updateOptions: UpdateMutationOptions<T>;
  deleteOptions: DeleteOptions<T>;
};

export function buildEntityMutations<T>({
  entityName,
  entityGraphQLType,
  createOptions: { args: createArgs, callback: createCallback },
  updateOptions: { args: updateArgs, callback: updateCallback },
  deleteOptions: { findCallback },
}: MutationsParams<T>): GraphQLFieldConfigMap<unknown, Context> {
  const createMutation: GraphQLFieldConfig<unknown, Context> = {
    type: entityGraphQLType,
    args: createArgs,
    description: `Creates ${entityName}`,
    resolve: async (_, { ...rest }, ctx) => {
      ctx.logger.info(`Executing mutation create from ${entityName}`);

      return createCallback(rest as T);
    },
  };

  const updateMutation: GraphQLFieldConfig<unknown, Context> = {
    type: entityGraphQLType,
    args: updateArgs,
    description: `Updates a ${entityName}`,
    resolve: async (_, { id, ...rest }, ctx) => {
      ctx.logger.info(`Executing mutation update from ${entityName}`);

      return updateCallback(id, rest as T);
    },
  };

  const deleteMutation: GraphQLFieldConfig<unknown, Context> = {
    type: entityGraphQLType,
    args: { id: { type: new GraphQLNonNull(GraphQLID) } },
    resolve: async (_, { id }, ctx) => {
      ctx.logger.info(`Would delete ${entityName}`, { id });

      return findCallback(id);
    },
  };

  return {
    [`create${entityName}`]: createMutation,
    [`update${entityName}`]: updateMutation,
    [`delete${entityName}`]: deleteMutation,
  };
}
