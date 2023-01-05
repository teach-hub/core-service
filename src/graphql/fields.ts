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

const findTypeObject = (
  type: GraphQLObjectType,
  findCallback: (id: string) => Promise<any>
) => {
  return {
    type: type,
    args: { id: { type: new GraphQLNonNull(GraphQLID) }},
    resolve: async (_: Source, { id }: any) => {
      return findCallback(id);
    },
  }
}

const findAllTypeObject = (
  type: GraphQLObjectType,
  typeName: string,
  findAllCallback: (args: object) => Promise<any>
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

const metaTypeObject = (
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
  findCallback: (id: string) => Promise<any>;
  findAllCallback: (args: object) => Promise<any>;
}

export const getGraphqlTypeFields = (
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
    [keyName]: findTypeObject(
      type,
      findCallback,
    ),
    [`all${keyName}s`]: findAllTypeObject(
      type,
      typeName,
      findAllCallback
    ),
    [`_all${keyName}sMeta`]: metaTypeObject(
      keyName,
      countCallback
    )
  }
}
