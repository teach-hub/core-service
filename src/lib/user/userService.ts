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

import type { OrderingOptions } from '../../utils';
import type { Optional } from '../../types';

export type UserFields = {
  id: number;
  name: string;
  lastName: string;
  githubId: string;
  file: string;
  notificationEmail: string;
  active: boolean;
};

const buildModelFields = (user: UserModel): UserFields => ({
  id: user.id,
  name: user.name,
  lastName: user.lastName,
  githubId: user.githubId,
  active: user.active,
  file: user.file,
  notificationEmail: user.notificationEmail,
});

const buildQuery = ({
  id,
  githubId,
}: {
  id?: number;
  githubId?: Optional<string>;
}): WhereOptions<UserModel> => {
  let query: WhereOptions<UserModel> = {};

  if (id) {
    query = { ...query, id };
  }

  if (githubId) {
    query = { ...query, githubId };
  }

  return query;
};

export async function createUser(
  data: Omit<UserFields, 'id' | 'active'>
): Promise<UserFields | null> {
  if (!data.githubId) {
    throw new Error('Github ID is required');
  }

  const dataWithActiveField = { ...data, githubId: data.githubId!, active: true };

  const githubIdAlreadyUsed = await existsModel(UserModel, {
    githubId: dataWithActiveField.githubId,
  });

  if (githubIdAlreadyUsed) {
    throw new Error('Github ID already used');
  }

  return createModel(UserModel, dataWithActiveField, buildModelFields);
}

export const updateUser = async (id: number, data: UserFields): Promise<UserFields> => {
  // Buscamos si algun usuario existente tiene un id diferente al usuario.
  // Es decir si el github id va a colisionar con alguien mas.
  const collidingUser = await findUserByQuery({ githubId: data.githubId });

  if (collidingUser?.id != Number(id)) {
    throw new Error('Github ID already used');
  }

  return updateModel(UserModel, data, buildModelFields, buildQuery({ id }));
};

export const countUsers = (): Promise<number> => countModels<UserModel>(UserModel);

const findUserByQuery = async (
  query: WhereOptions<UserModel>
): Promise<UserFields | null> => {
  return findModel(UserModel, buildModelFields, query);
};

export const findUser = async ({
  userId,
}: {
  userId: number;
}): Promise<UserFields | null> => {
  return findUserByQuery(buildQuery({ id: userId }));
};

export const findUserWithGithubId = async (
  githubId: string
): Promise<UserFields | null> => {
  return findUserByQuery(buildQuery({ githubId }));
};

export const existsUserWithGitHubId = async (githubId: string): Promise<boolean> => {
  const user = await findUserWithGithubId(githubId);
  return !!user;
};

export const findUsersInCourse = async ({
  courseId,
}: {
  courseId: number;
}): Promise<UserFields[]> => {
  const userRoles = await findAllUserRoles({ forCourseId: courseId });

  const userIds: UserModel['id'][] = userRoles
    .map(userRole => userRole.userId)
    .filter((x): x is number => !!x);

  return findAllModels(UserModel, {}, buildModelFields, { id: { [Op.in]: userIds } });
};

type FindUsersFilter = OrderingOptions & {
  id?: UserModel['id'][];
};

export const findAllUsers = async (filter: FindUsersFilter): Promise<UserFields[]> => {
  const { id } = filter;

  const whereClause = {
    ...(id ? { id } : {}),
  };

  return findAllModels(UserModel, filter, buildModelFields, whereClause);
};
