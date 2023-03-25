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
  return btoa(`${entityName}:${dbId}`);
};

export const fromGlobalId = (globalId: GlobalId): EntityPayload => {
  const decoded = atob(globalId).split(':');
  return { entityName: decoded[0], dbId: decoded[1] };
};

export { RAArgs };
