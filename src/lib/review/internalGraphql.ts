import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';
import { getReviewFields } from './graphql';
import { dateToString } from '../../utils/dates';
import { Context } from '../../types';
import { getViewer } from '../user/internalGraphql';
import { createReview, findAllReviews } from './service';

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

export const reviewMutations: GraphQLFieldConfigMap<null, Context> = {
  createReview: {
    type: new GraphQLNonNull(InternalReviewType),
    description: 'Create a review',
    args: {
      submissionId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      grade: {
        type: GraphQLInt,
      },
      revisionRequested: {
        type: new GraphQLNonNull(GraphQLBoolean),
      },
    },
    resolve: async (_, args, context: Context) => {
      const viewer = await getViewer(context);
      const { submissionId: encodedSubmissionId, grade, revisionRequested } = args;

      const submissionId = fromGlobalIdAsNumber(encodedSubmissionId);

      await validateReviewOnCreation({ submissionId });

      context.logger.info(`Creating review with data: ` + JSON.stringify(args));

      return await createReview({
        submissionId,
        grade,
        revisionRequested,
        reviewerId: viewer.id,
        createdAt: undefined,
        updatedAt: undefined,
        id: undefined,
      });
    },
  },
};

const validateReviewOnCreation = async ({ submissionId }: { submissionId: number }) => {
  const existingReview = await findAllReviews({
    forSubmissionId: submissionId,
  });

  if (existingReview.length > 0) {
    throw new Error('Group name not available');
  }
};
