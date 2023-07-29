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
import { findReviewer } from '../reviewer/service';
import { findSubmission } from '../submission/submissionsService';
import { isDefinedAndNotEmpty } from '../../utils/object';

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
      try {
        const viewer = await getViewer(context);
        const { submissionId: encodedSubmissionId, grade, revisionRequested } = args;

        const submissionId = fromGlobalIdAsNumber(encodedSubmissionId);
        const reviewerId = await findReviewerAndCheckIfIsReviewerForSubmission({
          submissionId,
          viewerId: Number(viewer.id),
        });

        await validateReviewOnCreation({ submissionId });

        context.logger.info(`Creating review with data: ` + JSON.stringify(args));

        return await createReview({
          submissionId,
          grade,
          revisionRequested,
          reviewerId,
          createdAt: undefined,
          updatedAt: undefined,
          id: undefined,
        });
      } catch (error) {
        context.logger.error('Error performing mutation', { error });
        throw error;
      }
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
      try {
        const viewer = await getViewer(context);
        const { id: encodedId, grade, revisionRequested } = args;

        const id = fromGlobalId(encodedId).dbId;
        const review = await findReview({ reviewId: id });
        if (!isDefinedAndNotEmpty(review)) {
          throw new Error('Review not found');
        }

        const reviewerId = await findReviewerAndCheckIfIsReviewerForSubmission({
          submissionId: Number(review.submissionId),
          viewerId: Number(viewer.id),
        });

        const updatedReview = {
          ...review,
          grade,
          revisionRequested,
          reviewerId,
        };

        context.logger.info(
          `Updating review with data: ` + JSON.stringify(updatedReview)
        );

        return updateReview(id, updatedReview);
      } catch (error) {
        context.logger.error('Error performing mutation', { error });
        throw error;
      }
    },
  },
};

const validateReviewOnCreation = async ({ submissionId }: { submissionId: number }) => {
  const existingReview = await findAllReviews({
    forSubmissionId: submissionId,
  });

  if (existingReview.length > 0) {
    throw new Error('Review already created for submission');
  }
};

const findReviewerAndCheckIfIsReviewerForSubmission = async ({
  submissionId,
  viewerId,
}: {
  submissionId: number;
  viewerId: number;
}) => {
  const submission = await findSubmission({
    submissionId: submissionId,
  });
  /* Find reviewer, matching current viewer id for submission assignment */
  const currentReviewer = await findReviewer({
    reviewerUserId: viewerId,
    assignmentId: submission.assignmentId,
  });

  /* Check that viewer is reviewer for the submission submitter */
  if (currentReviewer.revieweeId !== submission.submitterId) {
    throw new Error('User is not a reviewer for this submission');
  }

  return currentReviewer?.id;
};
