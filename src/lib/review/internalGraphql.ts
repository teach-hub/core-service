import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { fromGlobalId, fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';
import { getReviewFields } from './graphql';
import { dateToString } from '../../utils/dates';
import { Context } from '../../types';
import { getViewer } from '../user/internalGraphql';
import { createReview, findAllReviews, findReview, updateReview } from './service';

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
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      }, // Required for permission check
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
  updateReview: {
    type: new GraphQLNonNull(InternalReviewType),
    description: 'Updates a review grade and / or revision requested status',
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      }, // Required for permission check
      grade: {
        type: GraphQLInt,
      },
      revisionRequested: {
        type: new GraphQLNonNull(GraphQLBoolean),
      },
    },
    resolve: async (_, args, context: Context) => {
      const viewer = await getViewer(context);
      const { id: encodedId, grade, revisionRequested } = args;

      const id = fromGlobalId(encodedId).dbId;
      const review = await findReview({ reviewId: id });
      const updatedReview = {
        ...review,
        grade,
        revisionRequested,
        reviewerId: viewer.id,
      };

      context.logger.info(`Updating review with data: ` + JSON.stringify(updatedReview));

      return updateReview(id, updatedReview);
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
