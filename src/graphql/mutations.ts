import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  Source
} from "graphql";
import {GraphqlObjectTypeFields} from "./utils";
import {IModelFields} from "../sequelize/types";

const buildCreateTypeMutation = (
  type: GraphQLObjectType,
  typeName: string,
  fields: GraphqlObjectTypeFields,
  createCallback: (args: any) => Promise<IModelFields>
) => {
  return {
    type: type,
    description: 'Creates a new ' + typeName,
    args: fields,
    resolve: async (_: Source, { ...rest }: any) => {
      console.log("Executing mutation create from " + typeName);

      return createCallback(rest)
    }
  }
}

const buildUpdateTypeMutation = (
  type: GraphQLObjectType,
  typeName: string,
  fields: GraphqlObjectTypeFields,
  updateCallback: (id: string, args: any) => Promise<IModelFields>
) => {
  return {
    type: type,
    description: 'Updates a ' + typeName,
    args: fields,
    resolve: async (_: Source, { id, ...rest }: any) => {
      console.log("Executing mutation update from " + typeName);

      return updateCallback(id, rest)
    }
  }
}

const buildDeleteTypeMutation = (
  type: GraphQLObjectType,
  typeName: string,
  findCallback: (id: string) => Promise<IModelFields>
) => {
  return {
    type: type,
    args: { id: { type: new GraphQLNonNull(GraphQLID) }},
    resolve: async (_: Source, { id }: any) => {
      console.log("Would delete " + typeName + ": ", { id })
      // Currently, not deleting entities

      return findCallback(id)
    }
  }
}

interface MutationsParams<T extends IModelFields> {
  type: GraphQLObjectType;
  keyName: string;
  typeName: string;
  createFields: GraphqlObjectTypeFields;
  updateFields: GraphqlObjectTypeFields;
  createCallback: (args: T) => Promise<T>;
  updateCallback: (id: string, args: T) => Promise<T>;
  findCallback: (id: string) => Promise<T>;
}

export const buildEntityMutations = <T extends IModelFields>(
  {
    type,
    keyName,
    typeName,
    createFields,
    updateFields,
    createCallback,
    updateCallback,
    findCallback,
  }: MutationsParams<T>
) => {
  return {
    ["create" + keyName]: buildCreateTypeMutation(
      type,
      typeName,
      createFields,
      createCallback
    ),
    ["update" + keyName]: buildUpdateTypeMutation(
      type,
      typeName,
      updateFields,
      updateCallback
    ),
    ["delete" + keyName]: buildDeleteTypeMutation(
      type,
      typeName,
      findCallback
    )
  }
}
