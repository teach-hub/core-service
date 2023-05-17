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
import type { Nullable, Optional } from '../../types';

type AdminUserFields = {
  id: Optional<number>;
  email: Optional<string>;
  password: Optional<string>;
  name: Optional<string>;
  lastName: Optional<string>;
};

const buildModelFields = (adminUser: Nullable<AdminUserModel>): AdminUserFields => {
  return {
    id: adminUser?.id,
    email: adminUser?.email,
    password: adminUser?.password,
    name: adminUser?.name,
    lastName: adminUser?.lastName,
  };
};

const buildQuery = (id: string): WhereOptions<AdminUserModel> => {
  return { id: Number(id) };
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
): Promise<AdminUserFields> {
  const dataWithPassword = {
    ...data,
    password: data.password ? data.password : crypto.randomBytes(20).toString('hex'),
  };

  await validate(dataWithPassword);
  const model = await createModel(AdminUserModel, dataWithPassword, buildModelFields);

  return model;
}

export async function updateAdminUser(
  id: string,
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
  adminUserId: string;
}): Promise<AdminUserFields> {
  return findModel(AdminUserModel, buildModelFields, buildQuery(adminUserId));
}

export async function findAllAdminUsers(
  options: OrderingOptions
): Promise<AdminUserFields[]> {
  return findAllModels(AdminUserModel, options, buildModelFields);
}
