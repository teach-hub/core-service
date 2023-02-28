import {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLFieldConfigArgumentMap,
  GraphQLID,
  GraphQLNonNull,
  GraphQLOutputType,
} from 'graphql';

import type { Context } from 'src/types';
import type { IModelFields } from 'src/sequelize/types';

const buildCreateTypeMutation = (
  type: GraphQLOutputType,
  typeName: string,
  fields: GraphQLFieldConfigArgumentMap,
  createCallback: (args: any) => Promise<IModelFields>
): GraphQLFieldConfig<unknown, Context> => ({
  type,
  description: 'Creates a new ' + typeName,
  args: fields,
  resolve: async (_, { ...rest }, ctx) => {
    ctx.logger.info('Executing mutation create from ' + typeName);

    return createCallback(rest);
  },
});

const buildUpdateTypeMutation = (
  type: GraphQLOutputType,
  typeName: string,
  fields: GraphQLFieldConfigArgumentMap,
  updateCallback: (id: string, args: any) => Promise<IModelFields>
): GraphQLFieldConfig<unknown, Context> => {
  return {
    type: type,
    description: 'Updates a ' + typeName,
    args: fields,
    resolve: async (_, { id, ...rest }, ctx) => {
      ctx.logger.info('Executing mutation update from ' + typeName);

      return updateCallback(id, rest);
    },
  };
};

const buildDeleteTypeMutation = (
  type: GraphQLOutputType,
  typeName: string,
  findCallback: (id: string) => Promise<IModelFields>
): GraphQLFieldConfig<unknown, Context> => {
  return {
    type: type,
    args: { id: { type: new GraphQLNonNull(GraphQLID) } },
    resolve: async (_: unknown, { id }: any, ctx: Context) => {
      ctx.logger.info('Would delete ' + typeName + ': ', { id });

      // Currently, not deleting entities
      return findCallback(id);
    },
  };
};

interface MutationsParams<T extends IModelFields> {
  type: GraphQLOutputType;
  keyName: string;
  typeName: string;
  createFields: GraphQLFieldConfigArgumentMap;
  updateFields: GraphQLFieldConfigArgumentMap;
  createCallback: (args: T) => Promise<T>;
  updateCallback: (id: string, args: T) => Promise<T>;
  findCallback: (id: string) => Promise<T>;
}

export const buildEntityMutations = <T extends IModelFields>({
  type,
  keyName,
  typeName,
  createFields,
  updateFields,
  createCallback,
  updateCallback,
  findCallback,
}: MutationsParams<T>): GraphQLFieldConfigMap<unknown, Context> => {
  return {
    ['create' + keyName]: buildCreateTypeMutation(
      type,
      typeName,
      createFields,
      createCallback
    ),
    ['update' + keyName]: buildUpdateTypeMutation(
      type,
      typeName,
      updateFields,
      updateCallback
    ),
    ['delete' + keyName]: buildDeleteTypeMutation(type, typeName, findCallback),
  };
};
