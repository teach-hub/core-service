import UserRoleModel from './userRoleModel';

import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import type User from '../user/userModel';
import type Course from '../course/courseModel';
import type { OrderingOptions } from '../../utils';
import type { WhereOptions } from 'sequelize';

export type UserRoleFields = {
  id: number;
  roleId: number;
  userId: number;
  courseId: number;
  active: boolean;
};

const buildModelFields = (userRole: UserRoleModel): UserRoleFields => {
  return {
    id: userRole.id,
    roleId: userRole.roleId,
    userId: userRole.userId,
    courseId: userRole.courseId,
    active: userRole.active,
  };
};

const buildQuery = (id: number): WhereOptions<UserRoleModel> => {
  return { id };
};

export async function createUserRole(
  data: Omit<UserRoleFields, 'id'>
): Promise<UserRoleFields | null> {
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
  id: number,
  data: UserRoleFields
): Promise<UserRoleFields> {
  return updateModel(UserRoleModel, data, buildModelFields, buildQuery(id));
}

export async function countUserRoles(): Promise<number> {
  return countModels<UserRoleModel>(UserRoleModel);
}

export async function findUserRole({
  id,
}: {
  id: number;
}): Promise<UserRoleFields | null> {
  return findModel(UserRoleModel, buildModelFields, buildQuery(id));
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
  id?: UserRoleModel['id'][];
  forUserId?: UserRoleModel['userId'];
  forCourseId?: UserRoleModel['courseId'];
};

export async function findAllUserRoles(
  filter: FindCoursesFilter
): Promise<UserRoleFields[]> {
  const { id, forUserId, forCourseId } = filter;

  const whereClause = {
    ...(forUserId ? { userId: forUserId } : {}),
    ...(forCourseId ? { courseId: forCourseId } : {}),
    ...(id ? { id: id } : {}),
  };

  return findAllModels(UserRoleModel, filter, buildModelFields, whereClause);
}
