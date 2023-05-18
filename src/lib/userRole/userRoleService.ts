import UserRoleModel from './userRoleModel';

import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import type { Nullable, Optional } from '../../types';
import type User from '../user/userModel';
import type Course from '../course/courseModel';
import type { OrderingOptions } from '../../utils';
import type { WhereOptions } from 'sequelize';

export type UserRoleFields = {
  id: Optional<number>;
  roleId: Optional<number>;
  userId: Optional<number>;
  courseId: Optional<number>;
  active: Optional<boolean>;
};

const buildModelFields = (userRole: Nullable<UserRoleModel>): UserRoleFields => {
  return {
    id: userRole?.id,
    roleId: userRole?.roleId,
    userId: userRole?.userId,
    courseId: userRole?.courseId,
    active: userRole?.active,
  };
};

const buildQuery = (id: string): WhereOptions<UserRoleModel> => {
  return { id: Number(id) };
};

export async function createUserRole(
  data: Omit<UserRoleFields, 'id'>
): Promise<UserRoleFields> {
  const dataWithActiveField = { ...data, active: true };

  if (!data.courseId || !data.userId) {
    throw new Error('Missing user or course');
  }

  const existingUserRole = await findUserRoleInCourse({
    courseId: data.courseId,
    userId: data.userId,
  });

  if (existingUserRole) {
    throw new Error('The user has a role in this course already');
  }

  return createModel(UserRoleModel, data, buildModelFields);
}

export async function updateUserRole(
  id: string,
  data: UserRoleFields
): Promise<UserRoleFields> {
  return updateModel(UserRoleModel, data, buildModelFields, buildQuery(id));
}

export async function countUserRoles(): Promise<number> {
  return countModels<UserRoleModel>(UserRoleModel);
}

export async function findUserRole({
  roleId,
}: {
  roleId: string;
}): Promise<UserRoleFields> {
  return findModel(UserRoleModel, buildModelFields, buildQuery(roleId));
}

export async function findUserRoleInCourse({
  courseId,
  userId,
}: {
  courseId: Course['id'];
  userId: User['id'];
}): Promise<UserRoleFields> {
  const whereClause = { courseId, userId };

  const userRoles = await findAllModels(UserRoleModel, {}, buildModelFields, whereClause);

  return userRoles[0];
}

type FindCoursesFilter = OrderingOptions & {
  forUserId?: UserRoleModel['userId'];
  forCourseId?: UserRoleModel['courseId'];
};

export async function findAllUserRoles(
  filter: FindCoursesFilter
): Promise<UserRoleFields[]> {
  const { forUserId, forCourseId } = filter;

  const whereClause = {
    ...(forUserId ? { userId: forUserId } : {}),
    ...(forCourseId ? { courseId: forCourseId } : {}),
  };

  return findAllModels(UserRoleModel, filter, buildModelFields, whereClause);
}
