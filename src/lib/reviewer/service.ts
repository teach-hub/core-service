// Create function that finds a reviewer based on assignment id
// using findModel function

import ReviewerModel from './model';
import { findAllModels } from '../../sequelize/serviceUtils';
import type { Nullable, Optional } from '../../types';

export type ReviewerFields = {
  id: Optional<number>;
  reviewerUserRoleId: Optional<number>;
  assignmentId: Optional<number>;
  revieweeUserId: Optional<number>;
};

const buildModelFields = (reviewer: Nullable<ReviewerModel>): ReviewerFields => {
  return {
    id: reviewer?.id,
    reviewerUserRoleId: reviewer?.reviewerUserRoleId,
    assignmentId: reviewer?.assignmentId,
    revieweeUserId: reviewer?.revieweeUserId,
  };
};

export const findReviewers = async ({ assignmentId }: { assignmentId: number }) => {
  const reviewer = await findAllModels(ReviewerModel, {}, buildModelFields, {
    assignmentId,
  });
  return reviewer;
};
