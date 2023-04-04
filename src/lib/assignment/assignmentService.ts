import { OrderingOptions } from '../../utils';
import AssignmentModel from './assignmentModel';
import { Nullable, Optional } from '../../types';
import { IModelFields, ModelAttributes } from '../../sequelize/types';

import { findModel, findAllModels } from '../../sequelize/serviceUtils';

import UserRoleModel from '../userRole/userRoleModel';

interface AssignmentFields extends IModelFields, ModelAttributes<AssignmentModel> {
  id: Optional<number>;
  startDate: Optional<Date>;
  endDate: Optional<Date>;
  link: Optional<string>;
  title: Optional<string>;
}

const buildModelFields = (assignment: Nullable<AssignmentModel>): AssignmentFields => {
  return {
    id: assignment?.id,
    link: assignment?.link,
    startDate: assignment?.startDate,
    endDate: assignment?.endDate,
    title: assignment?.title,
  };
};

type FindAssignmentsFilter = OrderingOptions & {
  forCourseId?: UserRoleModel['courseId'];
};

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
