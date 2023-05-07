import {
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
  GraphQLObjectType,
} from 'graphql';

import { toGlobalId } from '../../graphql/utils';

export const SubjectType = new GraphQLObjectType({
  name: 'SubjectType',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: s =>
        toGlobalId({
          entityName: 'subject',
          dbId: String(s.id) as string,
        }),
    },
    name: { type: new GraphQLNonNull(GraphQLString) },
    code: { type: new GraphQLNonNull(GraphQLString) },
    active: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
});
