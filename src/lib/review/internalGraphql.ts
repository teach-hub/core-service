import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { getReviewFields } from './graphql';
import { getViewer } from '../user/internalGraphql';
import { findReview, updateReview } from './service';
import { findSubmission } from '../submission/submissionsService';
import { dateToString } from '../../utils/dates';
import { fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';
import { findReviewer } from '../reviewer/service';

import type { ReviewFields } from './service';
import type { AuthenticatedContext } from 'src/context';

export const InternalReviewType = new GraphQLObjectType<
  ReviewFields,
  AuthenticatedContext
>({
  name: 'InternalReviewType',
  description: 'A review from a submission within TeachHub',
  fields: {
    ...getReviewFields({ addId: true }),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'review',
          dbId: s.id!,
        }),
    },
    submissionId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'submission',
          dbId: s.submissionId!,
        }),
    },
    reviewerId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'reviewer',
          dbId: s.reviewerId!,
        }),
    },
    reviewedAt: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Date when review was created',
      resolve: s => s.reviewedAt && dateToString(s.reviewedAt),
    },
    reviewedAgainAt: {
      type: GraphQLString,
      description: 'Date when review was created',
      resolve: s => s.reviewedAgainAt && dateToString(s.reviewedAgainAt),
    },
  },
});

export const reviewMutations: GraphQLFieldConfigMap<null, AuthenticatedContext> = {
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
    resolve: async (_, args, context: AuthenticatedContext) => {
      try {
        // Cambiar por un find directo.
        const viewer = await getViewer(context);

        if (!viewer) {
          throw new Error('Viewer not found');
        }

        const { id: encodedId, grade, revisionRequested } = args;

        const id = fromGlobalIdAsNumber(encodedId);
        const review = await findReview({ reviewId: id });
        if (!review) {
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

        const submission = await findSubmission({
          submissionId: review.submissionId!,
        });

        // Si la submission ya fue re-entregada (submittedAgainAt).
        // Entonces nosotros tambien tenemos que actualizar reviewedAgainAt
        const isReSubmission = !!submission?.submittedAgainAt;

        if (isReSubmission && !review.reviewedAgainAt) {
          updatedReview['reviewedAgainAt'] = new Date();
        }

        context.logger.info(
          `Updating review with data: ` + JSON.stringify(updatedReview)
        );

        return await updateReview(id, updatedReview);
      } catch (error) {
        context.logger.error('Error performing mutation', { error });
        throw error;
      }
    },
  },
};

export const findReviewerAndCheckIfIsReviewerForSubmission = async ({
  submissionId,
  viewerId,
}: {
  submissionId: number;
  viewerId: number;
}) => {
  const submission = await findSubmission({
    submissionId: submissionId,
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  /* Find reviewer, matching current viewer id for submission assignment */
  const currentReviewer = await findReviewer({
    reviewerUserId: viewerId,
    assignmentId: submission.assignmentId,
    revieweeId: submission.submitterId,
  });

  /* Check that viewer is reviewer for the submission submitter */
  if (!currentReviewer) {
    throw new Error('User is not a reviewer for this submission');
  }

  return currentReviewer?.id;
};
