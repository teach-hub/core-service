import { omit } from 'lodash';

import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import AssignmentModel from './assignmentModel';
import type { OrderingOptions } from '../../utils';
import type { Nullable, Optional } from '../../types';
import { dateToString } from '../../utils/dates';

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
  isGroup: Optional<boolean>;
};

const buildModelFields = (assignment: Nullable<AssignmentModel>): AssignmentFields => {
  return {
    id: assignment?.id,
    link: assignment?.link,
    startDate: assignment?.startDate && dateToString(assignment.startDate),
    endDate: assignment?.endDate && dateToString(assignment.endDate),
    title: assignment?.title,
    description: assignment?.description,
    allowLateSubmissions: assignment?.allowLateSubmissions,
    courseId: assignment?.courseId,
    active: assignment?.active,
    isGroup: assignment?.isGroup,
  };
};

type FindAssignmentsFilter = OrderingOptions & {
  forCourseId?: AssignmentModel['courseId'];
  active?: boolean;
  isGroup?: boolean;
};

export async function createAssignment(
  data: AssignmentFields
): Promise<AssignmentFields> {
  const dataWithActiveField = {
    ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
    ...(data.endDate ? { endDate: new Date(data.endDate) } : {}),
    ...omit(data, ['startDate', 'endDate']),
    active: true,
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
  const { forCourseId, active, isGroup } = options;

  const whereClause = {
    ...(forCourseId ? { courseId: forCourseId } : {}),
    ...(active ? { active: active } : {}),
    ...(isGroup ? { isGroup } : {}),
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
