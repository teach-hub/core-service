import { intersection } from 'lodash';
import SubmissionModel from './model';

import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';
import { findAssignment } from '../assignment/assignmentService';
import { findAllGroupParticipants } from '../groupParticipant/service';
import { findUserRoleInCourse } from '../userRole/userRoleService';
import { findAllGroups } from '../group/service';

import type { GroupFields } from '../group/service';
import type { UserFields } from '../user/userService';
import type { OrderingOptions } from '../../utils';
import type { Optional } from 'src/types';

export type SubmissionFields = {
  id: number;
  assignmentId: number;
  submitterId: number;
  submittedAt: Date;
  submittedAgainAt: Optional<Date>;
  pullRequestUrl: string;
};

const buildModelFields = (submission: SubmissionModel): SubmissionFields => {
  return {
    id: submission.id,
    assignmentId: submission.assignmentId,
    submitterId: submission.submitterId,
    submittedAt: submission.submittedAt,
    submittedAgainAt: submission.submittedAgainAt,
    pullRequestUrl: submission.pullRequestUrl,
  };
};

export async function updateSubmission(
  id: number,
  data: Partial<SubmissionFields>
): Promise<SubmissionFields> {
  return updateModel(SubmissionModel, data, buildModelFields, { id });
}

export async function findSubmission({
  submissionId,
}: {
  submissionId: number;
}): Promise<SubmissionFields | null> {
  return findModel(SubmissionModel, buildModelFields, { id: submissionId });
}

type FindAllFilter = {
  forAssignmentId?: number | number[];
  forSubmitterId?: number;
} & OrderingOptions;

export async function findAllSubmissions(
  filter: FindAllFilter
): Promise<SubmissionFields[]> {
  const { forAssignmentId, forSubmitterId } = filter;

  const whereClause = {
    ...(forAssignmentId ? { assignmentId: forAssignmentId } : {}),
    ...(forSubmitterId ? { submitterId: forSubmitterId } : {}),
  };

  return findAllModels(SubmissionModel, filter, buildModelFields, whereClause);
}

export async function countSubmissions(filters: FindAllFilter): Promise<number> {
  const whereClause = {
    ...(filters.forAssignmentId ? { assignmentId: filters.forAssignmentId } : {}),
    ...(filters.forSubmitterId ? { submitterId: filters.forSubmitterId } : {}),
  };

  return countModels(SubmissionModel, whereClause);
}

type CreateSubmissionInput = {
  submitterUserId: number;
  assignmentId: number;
  pullRequestUrl: string;
};

export async function createSubmission({
  submitterUserId,
  assignmentId,
  pullRequestUrl,
}: CreateSubmissionInput): Promise<SubmissionFields | null> {
  const assignment = await findAssignment({ assignmentId });
  const now = new Date();
  const startDate = assignment?.startDate && new Date(assignment.startDate);
  const endDate = assignment?.endDate && new Date(assignment.endDate);

  const isTooEarly = !!(startDate && now < startDate);
  const isTooLate = !!(endDate && now > endDate);

  if (isTooEarly || (isTooLate && !assignment.allowLateSubmissions)) {
    throw new Error('Assignment is not active.');
  }

  if (!assignment) {
    throw new Error('Assignment not found.');
  }

  // Si el TP es grupal buscamos el grupo asociado a submitterUserId
  // y hacemos un sanity check de que el submitter este entre los integrantes.

  let submitterId: GroupFields['id'] | UserFields['id'] | null = null;

  if (assignment.isGroup) {
    const submitterUserRole = await findUserRoleInCourse({
      userId: submitterUserId,
      courseId: assignment.courseId!,
    });

    const assignmentGroups = await findAllGroups({
      forAssignmentId: assignment.id,
    });

    const submitterGroups = await findAllGroupParticipants({
      forUserRoleId: submitterUserRole.id,
    });

    const submitterAssignmentGroupId = intersection(
      assignmentGroups.map(group => group.id),
      submitterGroups.map(group => group.groupId)
    );

    if (submitterAssignmentGroupId.length > 1) {
      throw new Error('Submitter belongs to more than one group for this assignment.');
    }

    if (!submitterAssignmentGroupId) {
      throw new Error('Submitter does not belong to a group for this assignment.');
    }

    submitterId = submitterAssignmentGroupId[0];
  } else {
    submitterId = submitterUserId;
  }

  return createModel(
    SubmissionModel,
    {
      submitterId,
      assignmentId,
      pullRequestUrl,
      submittedAt: new Date(),
    },
    buildModelFields
  );
}
