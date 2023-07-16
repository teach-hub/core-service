import { isNil } from 'lodash';

import SubmissionModel from './model';

import {
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import type { OrderingOptions } from '../../utils';

export type SubmissionFields = {
  id: number;
  assignmentId: number;
  userId: number;
  description: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  pullRequestUrl: string;
};

const buildModelFields = (
  submission: null | undefined | SubmissionModel
): SubmissionFields => {
  if (isNil(submission)) {
    // @ts-expect-error: FIXME
    return null;
  }

  return {
    id: submission.id,
    assignmentId: submission.assignmentId,
    userId: submission.userId,
    description: submission.description || '',
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
    pullRequestUrl: submission.pullRequestUrl,
  };
};

export async function updateSubmission(
  id: number,
  data: SubmissionModel
): Promise<SubmissionFields> {
  return updateModel(SubmissionModel, data, buildModelFields, { id });
}

export async function findSubmission({
  submissionId,
}: {
  submissionId: number;
}): Promise<SubmissionFields> {
  return findModel(SubmissionModel, buildModelFields, { id: submissionId });
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

export async function createSubmission(
  data: Partial<SubmissionFields>
): Promise<SubmissionFields> {
  return createModel(SubmissionModel, data, buildModelFields);
}
