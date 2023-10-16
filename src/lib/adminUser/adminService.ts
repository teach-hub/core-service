import crypto from 'crypto';

import { OrderingOptions } from '../../utils';
import {
  countModels,
  createModel,
  existsModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import AdminUserModel from './adminModel';

import type { WhereOptions } from 'sequelize';

type AdminUserFields = {
  id: number;
  email: string;
  password: string;
  name: string;
  lastName: string;
};

const buildModelFields = (adminUser: AdminUserModel): AdminUserFields => {
  return {
    id: adminUser.id,
    email: adminUser.email,
    password: adminUser.password,
    name: adminUser.name,
    lastName: adminUser.lastName,
  };
};

const buildQuery = (id: number): WhereOptions<AdminUserModel> => {
  return { id };
};

const validate = async (data: Omit<AdminUserFields, 'id'>): Promise<void> => {
  const emailAlreadyUsed = await existsModel(AdminUserModel, {
    email: data.email,
  });

  if (emailAlreadyUsed) {
    throw new Error('Email already used');
  }
};

export async function createAdminUser(
  data: Omit<AdminUserFields, 'id'>
): Promise<AdminUserFields | null> {
  const dataWithPassword = {
    ...data,
    password: data.password ? data.password : crypto.randomBytes(20).toString('hex'),
  };

  await validate(dataWithPassword);
  const model = await createModel(AdminUserModel, dataWithPassword, buildModelFields);

  return model;
}

export async function updateAdminUser(
  id: number,
  data: Omit<AdminUserFields, 'id'>
): Promise<AdminUserFields> {
  await validate(data);

  return updateModel(AdminUserModel, data, buildModelFields, buildQuery(id));
}

export async function countAdminUsers(): Promise<number> {
  return countModels<AdminUserModel>(AdminUserModel);
}

export async function findAdminUser({
  adminUserId,
}: {
  adminUserId: number;
}): Promise<AdminUserFields | null> {
  return findModel(AdminUserModel, buildModelFields, buildQuery(adminUserId));
}

export async function findAdminUserByBasic({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<AdminUserFields | null> {
  return findModel(AdminUserModel, buildModelFields, { email: username, password });
}

export async function findAllAdminUsers(
  options: OrderingOptions
): Promise<AdminUserFields[]> {
  return findAllModels(AdminUserModel, options, buildModelFields);
}
