import UserModel from "./userModel";

import { OrderingOptions } from "../../utils";
import {
  IModelFields,
  ModelAttributes,
  ModelWhereQuery,
} from "../../sequelize/types";
import { Nullable, Optional } from "../../types";
import {
  countModels,
  createModel,
  existsModel,
  findAllModels,
  findModel,
  updateModel,
} from "../../sequelize/serviceUtils";

interface UserFields extends IModelFields, ModelAttributes<UserModel> {
  name: Optional<string>;
  lastName: Optional<string>;
  githubId: Optional<string>;
  file: Optional<string>;
  notificationEmail: Optional<string>;
  active: Optional<boolean>;
}

const buildModelFields = (user: Nullable<UserModel>): UserFields => {
  return {
    id: user?.id,
    name: user?.name,
    lastName: user?.lastName,
    githubId: user?.githubId,
    active: user?.active,
    file: user?.file,
    notificationEmail: user?.notificationEmail,
  };
};

const buildQuery = (id: string): ModelWhereQuery<UserModel> => {
  return { id: Number(id) };
};

const validate = async (data: UserFields) => {
  const githubIdAlreadyUsed = await existsModel(UserModel, {
    githubId: data.githubId,
  });

  if (githubIdAlreadyUsed) throw new Error("Github is already used");
};

export async function createUser(data: UserFields): Promise<UserFields> {
  data.active = true; // Always create active

  await validate(data);
  return createModel(UserModel, data, buildModelFields);
}

export async function updateUser(
  id: string,
  data: UserFields
): Promise<UserFields> {
  await validate(data);
  return updateModel(UserModel, data, buildModelFields, buildQuery(id));
}

export async function countUsers(): Promise<number> {
  return countModels<UserModel>(UserModel);
}

export async function findUser({
  userId,
}: {
  userId: string;
}): Promise<UserFields> {
  return findModel(UserModel, buildModelFields, buildQuery(userId));
}

export async function findAllUsers(
  options: OrderingOptions
): Promise<UserFields[]> {
  return findAllModels(UserModel, options, buildModelFields);
}
