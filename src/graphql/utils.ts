import { GraphQLString, GraphQLInt } from 'graphql';

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
  const decoded = Buffer.from(globalId, 'base64').toString().split(':');
  return { entityName: decoded[0], dbId: decoded[1] };
};

export { RAArgs };
