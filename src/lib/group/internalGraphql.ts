import { GraphQLID, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { getGroupFields } from './graphql';
import { toGlobalId } from '../../graphql/utils';

export const InternalGroupType = new GraphQLObjectType({
  name: 'InternalGroupType',
  description: 'A group within TeachHub',
  fields: {
    ...getGroupFields({ addId: true }),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'group',
          dbId: String(s.id),
        }),
    },
    courseId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'course',
          dbId: String(s.courseId),
        }),
    },
  },
});
