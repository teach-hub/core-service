import { GraphQLObjectType, GraphQLString } from 'graphql';

import { toGlobalId } from '../../graphql/utils';

export const AssignmentType = new GraphQLObjectType({
  name: 'AssignmentType',
  fields: {
    id: {
      type: GraphQLString,
      resolve: s =>
        toGlobalId({
          entityName: 'assignment',
          dbId: String(s.id) as string,
        }),
    },
    startDate: { type: GraphQLString },
    endDate: { type: GraphQLString },
    link: { type: GraphQLString },
  },
});
