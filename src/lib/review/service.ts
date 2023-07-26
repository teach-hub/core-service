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
  id: Optional<number>;
  submissionId: Optional<number>;
  reviewerId: Optional<number>;
  grade: Optional<number>;
  revisionRequested: Optional<boolean>;
  createdAt: Optional<Nullable<Date>>;
  updatedAt: Optional<Nullable<Date>>;
};

const buildModelFields = (review: Nullable<ReviewModel>): ReviewFields => {
  return {
    id: review?.id,
    submissionId: review?.submissionId,
    reviewerId: review?.reviewerId,
    grade: review?.grade,
    revisionRequested: review?.revisionRequested,
    createdAt: review?.createdAt,
    updatedAt: review?.updatedAt,
  };
};

type FindReviewsFilter = OrderingOptions;

export async function createReview(data: ReviewFields): Promise<ReviewFields> {
  const completedData = {
    ...data,
    revisionRequested: false,
  };

  return createModel(ReviewModel, completedData, buildModelFields);
}

export async function updateReview(
  id: string,
  data: ReviewFields
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
  const whereClause = {};

  return findAllModels(ReviewModel, options, buildModelFields, whereClause);
}

export async function findReview({
  reviewId,
  submissionId,
}: {
  reviewId?: string;
  submissionId?: number;
}): Promise<ReviewFields> {
  return findModel(ReviewModel, buildModelFields, {
    ...(reviewId ? { id: Number(reviewId) } : {}),
    ...(submissionId ? { submissionId: submissionId } : {}),
  });
}
