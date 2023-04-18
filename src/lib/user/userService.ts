import UserModel from './userModel';
import { OrderingOptions } from '../../utils';
import { IModelFields, ModelAttributes, ModelWhereQuery } from '../../sequelize/types';
import { Nullable, Optional } from '../../types';
import {
  countModels,
  createModel,
  existsModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import { Op } from 'sequelize';

import { findAllUserRoles } from '../userRole/userRoleService';
import { isDefinedAndNotEmpty } from '../../utils/objectUtils';

export interface UserFields extends IModelFields, ModelAttributes<UserModel> {
  id: Optional<number>;
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

const buildQuery = ({
  id,
  githubId,
}: {
  id?: Optional<string>;
  githubId?: Optional<string>;
}): ModelWhereQuery<UserModel> => {
  const query: ModelWhereQuery<UserModel> = {};
  if (id) query.id = Number(id);
  if (githubId) query.githubId = githubId;

  return query;
};

const validate = async (data: UserFields) => {
  const githubIdAlreadyUsed = await existsModel(UserModel, {
    githubId: data.githubId,
  });

  if (githubIdAlreadyUsed) throw new Error('Github id already used');
};

export async function createUser(data: UserFields): Promise<UserFields> {
  data.active = true; // Always create active

  await validate(data);
  return createModel(UserModel, data, buildModelFields);
}

export const updateUser = async (id: string, data: UserFields): Promise<UserFields> => {
  await validate(data);
  return updateModel(UserModel, data, buildModelFields, buildQuery({ id }));
};

export const countUsers = (): Promise<number> => countModels<UserModel>(UserModel);

const findUserByQuery = async (
  query: ModelWhereQuery<UserModel>
): Promise<UserFields> => {
  return findModel(UserModel, buildModelFields, query);
};
export const findUser = async ({ userId }: { userId: string }): Promise<UserFields> => {
  return findUserByQuery(buildQuery({ id: userId }));
};

export const findUserWithGithubId = async (githubId: string): Promise<UserFields> => {
  return findUserByQuery(buildQuery({ githubId }));
};

export const existsUserWithGitHubId = async (githubId: string): Promise<boolean> => {
  const user = await findUserWithGithubId(githubId);
  return isDefinedAndNotEmpty(user);
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
