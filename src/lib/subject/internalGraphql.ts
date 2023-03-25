import { GraphQLString, GraphQLBoolean, GraphQLObjectType } from 'graphql';

import { toGlobalId } from '../../graphql/utils';

export const SubjectType = new GraphQLObjectType({
  name: 'SubjectType',
  fields: {
    id: {
      type: GraphQLString,
      resolve: s =>
        toGlobalId({
          entityName: 'subject',
          dbId: String(s.id) as string,
        }),
    },
    name: { type: GraphQLString },
    code: { type: GraphQLString },
    active: { type: GraphQLBoolean },
  },
});
