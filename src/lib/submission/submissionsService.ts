import type Sequelize from 'sequelize';

import SubmissionModel from './model';

import {
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import type { OrderingOptions } from '../../utils';
import type { Nullable, Optional } from '../../types';

type SubmissionFields = {
  id: Optional<number>;
  assignmentId: Optional<number>;
  userId: Optional<number>;
  description: Optional<string>;
};

function buildModelFields(submission: Nullable<SubmissionModel>): SubmissionFields {
  return {
    id: submission?.id,
    assignmentId: submission?.assignmentId,
    userId: submission?.userId,
    description: submission?.description,
  };
}

function buildQuery(id: number): Sequelize.WhereOptions<SubmissionModel> {
  return { id };
}

export async function createSubject(data: SubmissionModel): Promise<SubmissionFields> {
  return createModel(SubmissionModel, data, buildModelFields);
}

export async function updateSubmission(
  id: number,
  data: SubmissionModel
): Promise<SubmissionFields> {
  return updateModel(SubmissionModel, data, buildModelFields, buildQuery(id));
}

export async function findSubmission({
  submissionId,
}: {
  submissionId: number;
}): Promise<SubmissionFields> {
  return findModel(SubmissionModel, buildModelFields, buildQuery(submissionId));
}

type FindAllFilter = {
  forAssignmentId?: number;
  forUserId?: number;
} & OrderingOptions;

export async function findAllSubmissions(
  filter: FindAllFilter
): Promise<SubmissionFields[]> {
  const { forAssignmentId, forUserId } = filter;

  const whereClause = {
    ...(forAssignmentId ? { assignmentId: forAssignmentId } : {}),
    ...(forUserId ? { userId: forUserId } : {}),
  };

  return findAllModels(SubmissionModel, filter, buildModelFields, whereClause);
}
