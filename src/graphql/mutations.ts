import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  Source
} from "graphql";
import {GraphqlObjectTypeFields} from "./utils";

const createTypeMutation = (
  type: GraphQLObjectType,
  typeName: string,
  fields: GraphqlObjectTypeFields,
  createCallback: (args: any) => Promise<any>
) => {
  return {
    type: type,
    description: 'Creates a new ' + typeName,
    args: fields,
    resolve: async (_: Source, ...rest: any) => {
      console.log("Executing mutation create from " + typeName);

      return createCallback(rest)
    }
  }
}

const updateTypeMutation = (
  type: GraphQLObjectType,
  typeName: string,
  fields: GraphqlObjectTypeFields,
  updateCallback: (id: string, args: any) => Promise<any>
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

const deleteTypeMutation = (
  type: GraphQLObjectType,
  typeName: string,
  findCallback: (id: string) => Promise<any>
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

interface MutationsParams {
  type: GraphQLObjectType;
  keyName: string;
  typeName: string;
  createFields: GraphqlObjectTypeFields;
  updateFields: GraphqlObjectTypeFields;
  createCallback: (args: any) => Promise<any>;
  updateCallback: (id: string, args: any) => Promise<any>;
  findCallback: (id: string) => Promise<any>;
}

export const getMutations = (
  {
    type,
    keyName,
    typeName,
    createFields,
    updateFields,
    createCallback,
    updateCallback,
    findCallback,
  }: MutationsParams
) => {
  return {
    ["create" + keyName]: createTypeMutation(
      type,
      typeName,
      createFields,
      createCallback
    ),
    ["update" + keyName]: updateTypeMutation(
      type,
      typeName,
      updateFields,
      updateCallback
    ),
    ["delete" + keyName]: deleteTypeMutation(
      type,
      typeName,
      findCallback
    )
  }
}
