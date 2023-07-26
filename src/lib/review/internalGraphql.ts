import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { toGlobalId } from '../../graphql/utils';
import { getReviewFields } from './graphql';
import { dateToString } from '../../utils/dates';

export const InternalReviewType = new GraphQLObjectType({
  name: 'InternalReviewType',
  description: 'A review from a submission within TeachHub',
  fields: {
    ...getReviewFields({ addId: true }),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'review',
          dbId: String(s.id),
        }),
    },
    submissionId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'submission',
          dbId: String(s.submissionId),
        }),
    },
    reviewerId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'reviewer',
          dbId: String(s.reviewerId),
        }),
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Date when review was created',
      resolve: s => s.createdAt && dateToString(s.createdAt),
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Date when review was last updated',
      resolve: s => s.updatedAt && dateToString(s.updatedAt),
    },
  },
});

/* todo: mutations de crear y editar */
