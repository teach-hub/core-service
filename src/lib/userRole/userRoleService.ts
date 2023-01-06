import UserRoleModel from './userRoleModel';
import { OrderingOptions } from '../../utils';
import {countModels, createModel, findAllModels, findModel, updateModel} from "../../sequelize/serviceUtils";
import {IModelFields, ModelAttributes, ModelWhereQuery} from "../../sequelize/types";
import {Nullable, Optional} from "../../types";

interface UserRoleFields extends IModelFields, ModelAttributes<UserRoleModel> {
  roleId: Optional<number>;
  userId: Optional<number>;
  courseId: Optional<number>;
  active: Optional<boolean>;
}

const buildModelFields = (userRole: Nullable<UserRoleModel>): UserRoleFields => {
  return {
    id: userRole?.id,
    roleId: userRole?.roleId,
    userId: userRole?.userId,
    courseId: userRole?.courseId,
    active: userRole?.active,
  }
}

const buildQuery = (
  id: string
): ModelWhereQuery<UserRoleModel> => {
  return { id: Number(id) }
}

export async function createUserRole(
  data : UserRoleFields
) {
  data.active = true // Always create active
  return createModel(
    UserRoleModel,
    data,
    buildModelFields
  )
}

export async function updateUserRole(
  id: string,
  data: UserRoleFields
) {
  return updateModel(
    UserRoleModel,
    data,
    buildModelFields,
    buildQuery(id)
  )
}

export async function countUserRoles() {
  return countModels<UserRoleModel>(UserRoleModel)
}

export async function findUserRole({ roleId }: { roleId: string }) {
  return findModel(
    UserRoleModel,
    buildModelFields,
    buildQuery(roleId)
  )
}

export async function findAllUserRoles(options: OrderingOptions) {
  return findAllModels<UserRoleModel>(
    UserRoleModel,
    options,
    buildModelFields
  )
}
