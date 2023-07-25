import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  countReviews,
  createReview,
  findAllReviews,
  findReview,
  type ReviewFields,
  updateReview,
} from './service';

import { buildEntityFields } from '../../graphql/fields';
import { buildEntityMutations } from '../../graphql/mutations';

export const getReviewFields = ({ addId }: { addId: boolean }) => ({
  ...(addId
    ? {
        id: {
          type: GraphQLID,
        },
      }
    : {}),
  submissionId: {
    type: GraphQLID,
  },
  reviewerId: {
    type: GraphQLID,
  },
  reviewRequested: {
    type: GraphQLBoolean,
  },
  grade: {
    type: GraphQLInt,
  },
  createdAt: {
    type: GraphQLString,
  },
  updatedAt: {
    type: GraphQLString,
  },
});

export const ReviewType = new GraphQLObjectType({
  name: 'ReviewType',
  description: 'A group participant within TeachHub',
  fields: {
    ...getReviewFields({ addId: true }),
  },
});

const findReviewCallback = (id: string): Promise<ReviewFields> =>
  findReview({ reviewId: id });

const adminReviewsFields = buildEntityFields<ReviewFields>({
  type: ReviewType,
  keyName: 'Review',
  findCallback: findReviewCallback,
  findAllCallback: findAllReviews,
  countCallback: countReviews,
});

const adminReviewMutations = buildEntityMutations<ReviewFields>({
  entityName: 'Review',
  entityGraphQLType: ReviewType,
  createOptions: {
    args: getReviewFields({ addId: false }),
    callback: createReview,
  },
  updateOptions: {
    args: getReviewFields({ addId: true }),
    callback: updateReview,
  },
  deleteOptions: {
    findCallback: findReviewCallback,
  },
});

export { adminReviewMutations, adminReviewsFields };
