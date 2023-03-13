import UserModel from './userModel';
import { OrderingOptions } from '../../utils';
import { IModelFields, ModelAttributes, ModelWhereQuery } from '../../sequelize/types';
import { Nullable, Optional } from '../../types';
import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import { Op } from 'sequelize';

import { findAllUserRoles } from '../userRole/userRoleService';

interface UserFields extends IModelFields, ModelAttributes<UserModel> {
  name: Optional<string>;
  lastName: Optional<string>;
  githubId: Optional<string>;
  file: Optional<string>;
  notificationEmail: Optional<string>;
  active: Optional<boolean>;
}

const buildModelFields = (user: Nullable<UserModel>): UserFields => ({
  id: user?.id,
  name: user?.name,
  lastName: user?.lastName,
  githubId: user?.githubId,
  active: user?.active,
  file: user?.file,
  notificationEmail: user?.notificationEmail,
});

const buildQuery = (id: string): ModelWhereQuery<UserModel> => ({ id: Number(id) });

export async function createUser(data: UserFields): Promise<UserFields> {
  data.active = true; // Always create active
  return createModel(UserModel, data, buildModelFields);
}

export const updateUser = async (id: string, data: UserFields): Promise<UserFields> =>
  updateModel(UserModel, data, buildModelFields, buildQuery(id));

export const countUsers = (): Promise<number> => countModels<UserModel>(UserModel);

export const findUser = async ({ userId }: { userId: string }): Promise<UserFields> => {
  return findModel(UserModel, buildModelFields, buildQuery(userId));
};

export const findUsersInCourse = async ({
  courseId,
}: {
  courseId: number;
}): Promise<UserFields[]> => {
  const userRoles = await findAllUserRoles({ forCourseId: courseId });

  // @ts-expect-error: FIXME
  const userIds: UserModel['id'][] = userRoles
    .map(userRole => userRole.userId)
    .filter(x => !!x);

  return findAllModels(UserModel, {}, buildModelFields, { id: { [Op.in]: userIds } });
};

export const findAllUsers = async (options: OrderingOptions): Promise<UserFields[]> =>
  findAllModels(UserModel, options, buildModelFields);
