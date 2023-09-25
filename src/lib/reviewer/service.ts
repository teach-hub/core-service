import { Op } from 'sequelize';
import ReviewerModel from './model';
import {
  destroyModel,
  bulkCreateModel,
  findAllModels,
  findModel,
} from '../../sequelize/serviceUtils';

export type ReviewerFields = {
  id: number;
  reviewerUserId: number;
  assignmentId: number;
  revieweeId: number;
};

const buildModelFields = (reviewer: ReviewerModel): ReviewerFields => {
  return {
    id: reviewer.id,
    reviewerUserId: reviewer.reviewerUserId,
    assignmentId: reviewer.assignmentId,
    revieweeId: reviewer.revieweeId,
  };
};

export const findReviewers = async ({ assignmentId }: { assignmentId: number }) => {
  const reviewers = await findAllModels(
    ReviewerModel,
    { sortOrder: 'ASC', sortField: 'id' },
    buildModelFields,
    {
      assignmentId,
    }
  );

  return reviewers;
};

export function createReviewers(
  data: Omit<ReviewerFields, 'id'>[]
): Promise<ReviewerFields[]> {
  return bulkCreateModel(ReviewerModel, data, buildModelFields);
}

export function deleteReviewers({ ids }: { ids: number[] }): Promise<number> {
  return destroyModel(ReviewerModel, { id: { [Op.in]: ids } });
}

export const findReviewer = async ({
  revieweeId,
  reviewerUserId,
  assignmentId,
}: {
  revieweeId?: number;
  reviewerUserId?: number;
  assignmentId?: number;
}): Promise<ReviewerFields | null> => {
  const query = {
    ...(reviewerUserId ? { reviewerUserId } : {}),
    ...(revieweeId ? { revieweeId } : {}),
    ...(assignmentId ? { assignmentId } : {}),
  };

  return findModel(ReviewerModel, buildModelFields, query);
};
