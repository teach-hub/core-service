import ReviewerModel from './model';
import { bulkCreateModel, findAllModels, findModel } from '../../sequelize/serviceUtils';
import type { Nullable, Optional } from '../../types';

export type ReviewerFields = {
  id: Optional<number>;
  reviewerUserId: Optional<number>;
  assignmentId: Optional<number>;
  revieweeId: Optional<number>;
};

const buildModelFields = (reviewer: Nullable<ReviewerModel>): ReviewerFields => {
  return {
    id: reviewer?.id,
    reviewerUserId: reviewer?.reviewerUserId,
    assignmentId: reviewer?.assignmentId,
    revieweeId: reviewer?.revieweeId,
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

export const findReviewer = async ({
  userId,
  assignmentId,
}: {
  userId?: number;
  assignmentId?: number;
}): Promise<ReviewerFields> => {
  const query = {
    ...(userId ? { revieweeUserId: userId } : {}),
    ...(assignmentId ? { assignmentId: assignmentId } : {}),
  };

  return findModel(ReviewerModel, buildModelFields, query);
};
