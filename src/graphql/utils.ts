import { GraphQLInt, GraphQLString } from 'graphql';

const RAArgs = {
  page: { type: GraphQLInt },
  perPage: { type: GraphQLInt },
  sortField: { type: GraphQLString },
  sortOrder: { type: GraphQLString },
};

type GlobalId = string;
type EntityPayload = { entityName: string; dbId: number | string };

export const toGlobalId = ({ dbId, entityName }: EntityPayload): GlobalId => {
  return Buffer.from(`${entityName}:${dbId}`).toString('base64');
};

export const fromGlobalIdAsNumber = (globalId: GlobalId): number => {
  if (typeof globalId !== 'string') {
    throw new TypeError(`Received invalid globalId, value ${globalId}`);
  }

  const [_entityName, databaseId] = Buffer.from(globalId, 'base64').toString().split(':');
  return Number(databaseId)
}

export { RAArgs };
