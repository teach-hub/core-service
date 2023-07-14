import UserModel from './userModel';
import {
  countModels,
  createModel,
  existsModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import { Op, WhereOptions } from 'sequelize';

import { findAllUserRoles } from '../userRole/userRoleService';
import { isDefinedAndNotEmpty } from '../../utils/object';

import type { OrderingOptions } from '../../utils';
import type { Nullable, Optional } from '../../types';

export type UserFields = {
  id: Optional<number>;
  name: Optional<string>;
  lastName: Optional<string>;
  githubId: Optional<string>;
  file: Optional<string>;
  notificationEmail: Optional<string>;
  active: Optional<boolean>;
};

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
}): WhereOptions<UserModel> => {
  let query: WhereOptions<UserModel> = {};

  if (id) {
    query = { ...query, id: Number(id) };
  }

  if (githubId) {
    query = { ...query, githubId };
  }

  return query;
};

export async function createUser(data: UserFields): Promise<UserFields> {
  const dataWithActiveField = { ...data, active: true };

  const githubIdAlreadyUsed = await existsModel(UserModel, {
    githubId: dataWithActiveField.githubId,
  });

  if (githubIdAlreadyUsed) {
    throw new Error('Github ID already used');
  }

  return createModel(UserModel, dataWithActiveField, buildModelFields);
}

export const updateUser = async (id: string, data: UserFields): Promise<UserFields> => {
  // Buscamos si algun usuario existente tiene un id diferente al usuario.
  // Es decir si el github id va a colisionar con alguien mas.
  const collidingUser = await findUserByQuery({ githubId: data.githubId });

  if (collidingUser.id != Number(id)) {
    throw new Error('Github ID already used');
  }

  return updateModel(UserModel, data, buildModelFields, buildQuery({ id }));
};

export const countUsers = (): Promise<number> => countModels<UserModel>(UserModel);

const findUserByQuery = async (query: WhereOptions<UserModel>): Promise<UserFields> => {
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

type FindUsersFilter = OrderingOptions & {
  id?: UserModel['id'][];
};

export const findAllUsers = async (filter: FindUsersFilter): Promise<UserFields[]> => {
  const { id } = filter;

  const whereClause = {
    ...(id ? { id: id } : {}),
  };

  return findAllModels(UserModel, filter, buildModelFields, whereClause);
};
