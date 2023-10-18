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

const validate = async ({
  email,
}: Omit<AdminUserFields, 'id' | 'password'>): Promise<void> => {
  const emailAlreadyUsed = await existsModel(AdminUserModel, { email });

  if (emailAlreadyUsed) {
    throw new Error('Email already used');
  }
};

export async function createAdminUser(
  data: Omit<AdminUserFields, 'id' | 'password'>
): Promise<AdminUserFields | null> {
  const secret = process.env.PASSWORD_HASH_SECRET;

  if (!secret) {
    throw new Error('Missing hash secret!');
  }

  await validate(data);

  const generatedPassword = crypto.randomBytes(10).toString('hex');
  const encryptedPassword = crypto
    .createHmac('sha512', secret)
    .update(generatedPassword)
    .digest('hex');

  const dataWithPassword = {
    ...data,
    password: encryptedPassword,
  };

  const createdUser = await createModel(
    AdminUserModel,
    dataWithPassword,
    buildModelFields
  );

  if (!createdUser) {
    return null;
  }

  return { ...createdUser, password: generatedPassword };
}

export async function updateAdminUser(
  id: number,
  data: Omit<AdminUserFields, 'id'>
): Promise<AdminUserFields> {
  await validate(data);

  return updateModel(AdminUserModel, data, buildModelFields, { id });
}

export async function countAdminUsers(): Promise<number> {
  return countModels<AdminUserModel>(AdminUserModel);
}

export async function findAdminUser({
  adminUserId,
}: {
  adminUserId: number;
}): Promise<AdminUserFields | null> {
  return findModel(AdminUserModel, buildModelFields, { id: adminUserId });
}

export async function findAdminUserByBasic({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<AdminUserFields | null> {
  const secret = process.env.PASSWORD_HASH_SECRET;

  if (!secret) {
    throw new Error('Missing hash secret!');
  }

  const encryptedPassword = crypto
    .createHmac('sha512', secret)
    .update(password)
    .digest('hex');

  return findModel(AdminUserModel, buildModelFields, {
    email: username,
    password: encryptedPassword,
  });
}

export async function findAllAdminUsers(
  options: OrderingOptions
): Promise<AdminUserFields[]> {
  return findAllModels(AdminUserModel, options, buildModelFields);
}
