import { omit } from 'lodash';

import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import AssignmentModel from './assignmentModel';
import { dateToString } from '../../utils/dates';

import type { OrderingOptions } from '../../utils';
import type { Optional } from 'src/types';

export type AssignmentFields = {
  id: number;
  startDate: Optional<string>;
  endDate: Optional<string>;
  link: Optional<string>
  title: string;
  courseId: number;
  description: Optional<string>;
  allowLateSubmissions: boolean;
  active: boolean;
  isGroup: boolean;
};

const buildModelFields = (assignment: AssignmentModel): AssignmentFields => {
  return {
    id: assignment.id,
    link: assignment.link,
    startDate: assignment.startDate && dateToString(assignment.startDate),
    endDate: assignment.endDate && dateToString(assignment.endDate),
    title: assignment.title,
    description: assignment.description,
    allowLateSubmissions: assignment.allowLateSubmissions,
    courseId: assignment.courseId,
    active: assignment.active,
    isGroup: assignment.isGroup,
  };
};

type FindAssignmentsFilter = OrderingOptions & {
  forCourseId?: AssignmentModel['courseId'];
  active?: boolean;
  isGroup?: boolean;
};

export async function createAssignment(
  data: AssignmentFields
): Promise<AssignmentFields | null> {

  if (!data.courseId) {
    throw new Error('courseId is required');
  }

  const dataWithActiveField = {
    ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
    ...(data.endDate ? { endDate: new Date(data.endDate) } : {}),
    ...omit(data, ['startDate', 'endDate']),
    active: true,
  };

  return createModel(AssignmentModel, dataWithActiveField, buildModelFields);
}

export async function updateAssignment(
  id: number,
  data: AssignmentFields
): Promise<AssignmentFields> {
  const dataWithActiveField = {
    ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
    ...(data.endDate ? { endDate: new Date(data.endDate) } : {}),
    ...omit(data, ['startDate', 'endDate']),
  };

  return updateModel(AssignmentModel, dataWithActiveField, buildModelFields, { id });
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
  assignmentId: number;
}): Promise<AssignmentFields> {
  return findModel(AssignmentModel, buildModelFields, { id: assignmentId });
}
