import AdminUserModel from "./adminModel";
import { OrderingOptions } from "../../utils";
import crypto from "crypto";
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

interface AdminUserFields
  extends IModelFields,
    ModelAttributes<AdminUserModel> {
  email: Optional<string>;
  password: Optional<string>;
  name: Optional<string>;
  lastName: Optional<string>;
}

const buildModelFields = (
  adminUser: Nullable<AdminUserModel>
): AdminUserFields => {
  return {
    id: adminUser?.id,
    email: adminUser?.email,
    password: adminUser?.password,
    name: adminUser?.name,
    lastName: adminUser?.lastName,
  };
};

const buildQuery = (id: string): ModelWhereQuery<AdminUserModel> => {
  return { id: Number(id) };
};

const validate = async (data: AdminUserFields) => {
  const emailAlreadyUsed = await existsModel(AdminUserModel, {
    email: data.email,
  });

  if (emailAlreadyUsed) throw new Error("Email already used");
};

export async function createAdminUser(
  data: AdminUserFields
): Promise<AdminUserFields> {
  data.password = data.password
    ? data.password
    : crypto.randomBytes(20).toString("hex");

  await validate(data);
  return createModel(AdminUserModel, data, buildModelFields);
}

export async function updateAdminUser(
  id: string,
  data: AdminUserFields
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
