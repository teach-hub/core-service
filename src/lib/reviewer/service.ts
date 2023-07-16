import ReviewerModel from './model';
import { bulkCreateModel, findAllModels } from '../../sequelize/serviceUtils';
import type { Nullable, Optional } from '../../types';

export type ReviewerFields = {
  id: Optional<number>;
  reviewerUserId: Optional<number>;
  assignmentId: Optional<number>;
  revieweeUserId: Optional<number>;
  revieweeGroupId: Optional<number>;
};

const buildModelFields = (reviewer: Nullable<ReviewerModel>): ReviewerFields => {
  return {
    id: reviewer?.id,
    reviewerUserId: reviewer?.reviewerUserId,
    assignmentId: reviewer?.assignmentId,
    revieweeUserId: reviewer?.revieweeUserId,
    revieweeGroupId: reviewer?.revieweeGroupId,
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
