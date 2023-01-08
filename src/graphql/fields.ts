import {RAArgs} from "./utils";
import {OrderingOptions} from "../utils";
import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  Source
} from "graphql";
import {IModelFields} from "../sequelize/types";

const buildFindTypeObject = (
  type: GraphQLObjectType,
  findCallback: (id: string) => Promise<IModelFields>
) => {
  return {
    type: type,
    args: { id: { type: new GraphQLNonNull(GraphQLID) }},
    resolve: async (_: Source, { id }: any) => {
      return findCallback(id);
    },
  }
}

const buildFindAllTypeObject = (
  type: GraphQLObjectType,
  typeName: string,
  findAllCallback: (args: OrderingOptions) => Promise<IModelFields[]>
) => {
  return {
    type: new GraphQLList(type),
    description: "List of " + typeName + " on the whole application",
    args: RAArgs,
    resolve: async (_: Source, { page, perPage, sortField, sortOrder }: OrderingOptions) => {
      return findAllCallback({ page, perPage, sortField, sortOrder });
    }
  }
}

const buildMetaTypeObject = (
  keyName: string,
  countCallback: () => Promise<number>
) => {
  return {
    type: new GraphQLObjectType({
      name: keyName + 'ListMetadata',
      fields: { count: { type: GraphQLInt }}
    }),
    args: RAArgs,
    resolve: async () => {
      return countCallback().then(count => ({ count }));
    }
  }
};

interface FieldParams {
  type: GraphQLObjectType;
  keyName: string;
  typeName: string;
  countCallback: () => Promise<number>;
  findCallback: (id: string) => Promise<IModelFields>;
  findAllCallback: (args: OrderingOptions) => Promise<IModelFields[]>;
}

export const buildEntityFields = (
  {
    type,
    keyName,
    typeName,
    countCallback,
    findCallback,
    findAllCallback,
  }: FieldParams
) => {
  return {
    [keyName]: buildFindTypeObject(
      type,
      findCallback,
    ),
    [`all${keyName}s`]: buildFindAllTypeObject(
      type,
      typeName,
      findAllCallback
    ),
    [`_all${keyName}sMeta`]: buildMetaTypeObject(
      keyName,
      countCallback
    )
  }
}
