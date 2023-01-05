import UserRoleModel from './userRoleModel';
import { OrderingOptions } from '../../utils';
import {countModels, createModel, findAllModels, findModel, updateModel} from "../serviceUtils";


const buildObject = (userRole: UserRoleModel | null) => {
  return {
    id: userRole?.id,
    roleId: userRole?.roleId,
    userId: userRole?.userId,
    courseId: userRole?.courseId,
    active: userRole?.active,
  }
}

interface ModelAttrs {
  roleId?: string;
  userId?: string;
  courseId?: string;
  active?: boolean;
}

const readFields = (attrs: ModelAttrs) => {
  return {
    roleId: attrs.roleId ? Number(attrs.roleId) : null,
    userId: attrs.userId ? Number(attrs.userId) : null,
    courseId: attrs.courseId ? Number(attrs.courseId) : null,
    active: attrs.active,
  }
}

export async function createUserRole(
  attrs : ModelAttrs
) {
  attrs.active = true // Always create active
  return createModel(
    UserRoleModel,
    readFields(attrs),
    buildObject
  )
}

export async function updateUserRole(
  id: string,
  attrs: ModelAttrs
) {
  return updateModel(
    UserRoleModel,
    id,
    readFields(attrs),
    buildObject,
    (id) => {
      return { id: id }
    }
  )
}

export async function countUserRoles() {
  return countModels<UserRoleModel>(UserRoleModel)
}

export async function findUserRole({ roleId }: { roleId: string }) {
  return findModel(
    roleId,
    UserRoleModel,
    buildObject,
    (id) => {
      return { id: id }
    }
  )
}

export async function findAllUserRoles(options: OrderingOptions) {
  return findAllModels<UserRoleModel>(
    options,
    UserRoleModel,
    buildObject
  )
}
