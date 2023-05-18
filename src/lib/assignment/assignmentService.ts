import { omit } from 'lodash';

import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import AssignmentModel from './assignmentModel';

import type UserRoleModel from '../userRole/userRoleModel';
import type { OrderingOptions } from '../../utils';
import type { Nullable, Optional } from '../../types';

export type AssignmentFields = {
  id: Optional<number>;
  startDate: Optional<string>;
  endDate: Optional<string>;
  link: Optional<string>;
  title: Optional<string>;
  courseId: Optional<number>;
  description: Optional<string>;
  allowLateSubmissions: Optional<boolean>;
  active: Optional<boolean>;
};

const buildModelFields = (assignment: Nullable<AssignmentModel>): AssignmentFields => {
  return {
    id: assignment?.id,
    link: assignment?.link,
    startDate: assignment?.startDate?.toISOString(),
    endDate: assignment?.endDate?.toISOString(),
    title: assignment?.title,
    description: assignment?.description,
    allowLateSubmissions: assignment?.allowLateSubmissions,
    courseId: assignment?.courseId,
    active: assignment?.active,
  };
};

type FindAssignmentsFilter = OrderingOptions & {
  forCourseId?: UserRoleModel['courseId'];
};

export async function createAssignment(
  data: AssignmentFields
): Promise<AssignmentFields> {
  const dataWithActiveField = {
    ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
    ...(data.endDate ? { endDate: new Date(data.endDate) } : {}),
    ...omit(data, ['startDate', 'endDate']),
  };

  return createModel(AssignmentModel, dataWithActiveField, buildModelFields);
}

export async function updateAssignment(
  id: string,
  data: AssignmentFields
): Promise<AssignmentFields> {
  const dataWithActiveField = {
    ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
    ...(data.endDate ? { endDate: new Date(data.endDate) } : {}),
    ...omit(data, ['startDate', 'endDate']),
  };

  return updateModel(AssignmentModel, dataWithActiveField, buildModelFields, {
    id: Number(id),
  });
}

export async function countAssignments(): Promise<number> {
  return countModels<AssignmentModel>(AssignmentModel);
}

export async function findAllAssignments(
  options: FindAssignmentsFilter
): Promise<AssignmentFields[]> {
  const { forCourseId } = options;

  const whereClause = {
    ...(forCourseId ? { courseId: forCourseId } : {}),
  };

  return findAllModels(AssignmentModel, options, buildModelFields, whereClause);
}

export async function findAssignment({
  assignmentId,
}: {
  assignmentId: string;
}): Promise<AssignmentFields> {
  return findModel(AssignmentModel, buildModelFields, { id: Number(assignmentId) });
}
