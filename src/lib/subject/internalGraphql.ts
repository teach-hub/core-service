import {
  GraphQLID,
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
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'subject',
          dbId: s.id,
        }),
    },
    name: { type: new GraphQLNonNull(GraphQLString) },
    code: { type: new GraphQLNonNull(GraphQLString) },
    active: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
});
