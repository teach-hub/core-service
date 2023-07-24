import { GraphQLInt, GraphQLString } from 'graphql';

const RAArgs = {
  page: { type: GraphQLInt },
  perPage: { type: GraphQLInt },
  sortField: { type: GraphQLString },
  sortOrder: { type: GraphQLString },
};

type GlobalId = string;
type EntityPayload = { entityName: string; dbId: string };

export const toGlobalId = ({ dbId, entityName }: EntityPayload): GlobalId => {
  return Buffer.from(`${entityName}:${dbId}`).toString('base64');
};

export const fromGlobalId = (globalId: GlobalId): EntityPayload => {
  if (typeof globalId !== 'string') {
    throw new TypeError(`Received invalid globalId, value ${globalId}`);
  }

  const decoded = Buffer.from(globalId, 'base64').toString().split(':');
  return { entityName: decoded[0], dbId: decoded[1] };
};

export const fromGlobalIdAsNumber = (globalId: GlobalId): number =>
  Number(fromGlobalId(globalId).dbId);

export { RAArgs };
