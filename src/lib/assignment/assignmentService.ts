import { OrderingOptions } from '../../utils';
import AssignmentModel from './assignmentModel';
import { Nullable, Optional } from '../../types';
import { IModelFields, ModelAttributes, ModelWhereQuery } from '../../sequelize/types';

import { findAllModels } from '../../sequelize/serviceUtils';

import UserRoleModel from '../userRole/userRoleModel';

interface AssignmentFields extends IModelFields, ModelAttributes<AssignmentModel> {
  id: Optional<number>;
  startDate: Optional<Date>;
  endDate: Optional<Date>;
  link: Optional<string>;
}

const buildModelFields = (assignment: Nullable<AssignmentModel>): AssignmentFields => {
  return {
    id: assignment?.id,
    link: assignment?.link,
    startDate: assignment?.startDate,
    endDate: assignment?.endDate,
  };
};

type FindAssignmentsFilter = OrderingOptions & {
  forUserId?: UserRoleModel['userId'];
  forCourseId?: UserRoleModel['courseId'];
};

export async function findAllAssignments(
  options: FindAssignmentsFilter
): Promise<AssignmentFields[]> {
  return findAllModels(AssignmentModel, options, buildModelFields);
}
