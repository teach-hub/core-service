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
import type { IModelFields } from 'src/sequelize/types';
import type { Context } from 'src/types';

const buildFindTypeObject = (
  type: GraphQLOutputType,
  findCallback: (id: string) => Promise<IModelFields>
): GraphQLFieldConfig<unknown, Context> => {
  return {
    type: type,
    args: { id: { type: GraphQLID } },
    resolve: async (_: unknown, { id }: any) => {
      return findCallback(id);
    },
  };
};

const buildFindAllTypeObject = (
  type: GraphQLOutputType,
  typeName: string,
  findAllCallback: (args: OrderingOptions) => Promise<IModelFields[]>
): GraphQLFieldConfig<unknown, Context> => {
  return {
    type: new GraphQLList(type),
    description: 'List of ' + typeName + ' on the whole application',
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
      name: keyName + 'ListMetadata',
      fields: { count: { type: GraphQLInt } },
    }),
    args: RAArgs,
    resolve: async () => {
      return countCallback().then(count => ({ count }));
    },
  };
};

interface FieldParams {
  type: GraphQLOutputType;
  keyName: string;
  typeName: string;
  countCallback: () => Promise<number>;
  findCallback: (id: string) => Promise<IModelFields>;
  findAllCallback: (args: OrderingOptions) => Promise<IModelFields[]>;
}

export const buildEntityFields = ({
  type,
  keyName,
  typeName,
  countCallback,
  findCallback,
  findAllCallback,
}: FieldParams): GraphQLFieldConfigMap<unknown, Context> => {
  return {
    [keyName]: buildFindTypeObject(type, findCallback),
    [`all${keyName}s`]: buildFindAllTypeObject(type, typeName, findAllCallback),
    [`_all${keyName}sMeta`]: buildMetaTypeObject(keyName, countCallback),
  };
};
