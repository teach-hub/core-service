import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { toGlobalId } from '../../graphql/utils';

export const AssignmentType = new GraphQLObjectType({
  name: 'AssignmentType',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: s =>
        toGlobalId({
          entityName: 'assignment',
          dbId: String(s.id) as string,
        }),
    },
    title: { type: GraphQLString },
    startDate: { type: GraphQLString },
    endDate: { type: GraphQLString },
    link: { type: GraphQLString },
  },
});
