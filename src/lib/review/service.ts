import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import ReviewModel from './model';
import type { OrderingOptions } from '../../utils';
import type { Nullable, Optional } from '../../types';

export type ReviewFields = {
  id: number;
  submissionId: number;
  reviewerId: number;
  grade: Optional<number>;
  revisionRequested: Optional<boolean>;
  reviewedAt: Date;
  reviewedAgainAt: Optional<Date>;
};

const buildModelFields = (review: ReviewModel): ReviewFields => {
  return {
    id: review.id,
    submissionId: review.submissionId,
    reviewerId: review.reviewerId,
    grade: review.grade,
    revisionRequested: review.revisionRequested,
    reviewedAt: review.reviewedAt,
    reviewedAgainAt: review.reviewedAgainAt,
  };
};

type FindReviewsFilter = OrderingOptions & {
  forSubmissionId?: number;
};

export async function createReview(data: ReviewFields): Promise<ReviewFields | null> {
  const completedData = {
    ...data,
    revisionRequested: data.revisionRequested || false,
    reviewedAt: new Date(),
  };

  return createModel(ReviewModel, completedData, buildModelFields);
}

export async function updateReview(
  id: number,
  data: Omit<ReviewFields, 'id'>
): Promise<ReviewFields> {
  return updateModel(ReviewModel, data, buildModelFields, {
    id: Number(id),
  });
}

export async function countReviews(): Promise<number> {
  return countModels<ReviewModel>(ReviewModel);
}

export async function findAllReviews(
  options: FindReviewsFilter
): Promise<ReviewFields[]> {
  const whereClause = {
    ...(options.forSubmissionId ? { submissionId: options.forSubmissionId } : {}),
  };

  return findAllModels(ReviewModel, options, buildModelFields, whereClause);
}

export async function findReview({
  reviewId,
  submissionId,
  reviewerId,
}: {
  reviewId?: number;
  submissionId?: number;
  reviewerId?: number;
}): Promise<ReviewFields | null> {
  return findModel(ReviewModel, buildModelFields, {
    ...(reviewId ? { id: reviewId } : {}),
    ...(submissionId ? { submissionId } : {}),
    ...(reviewerId ? { reviewerId } : {}),
  });
}
