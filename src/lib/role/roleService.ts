import RoleModel from './roleModel';
import { OrderingOptions } from '../../utils';
import { ALL_PERMISSIONS } from '../../consts';
import { IModelFields, ModelAttributes, ModelWhereQuery } from '../../sequelize/types';
import { Nullable, Optional } from '../../types';
import AdminUserModel from '../adminUser/adminModel';
import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

const encodePermissions = (permissions: string[]): string => permissions.join(',');
const decodePermissions = (encoded: string): string[] => encoded.split(',');

const isInvalidPermission = (p: string) => !ALL_PERMISSIONS.includes(p);

interface RoleCommonFields extends IModelFields {
  name: Optional<string>;
  parentRoleId: Optional<number>;
  active: Optional<boolean>;
}

export interface RoleFields extends RoleCommonFields {
  permissions: Optional<string[]>;
}

export interface RoleAttrs extends IModelFields, ModelAttributes<RoleModel> {
  permissions: Optional<string>;
}

const buildModelFields = (role: Nullable<RoleModel>): RoleFields => {
  return {
    id: role?.id,
    name: role?.name,
    permissions: decodePermissions(role?.permissions ?? ''),
    parentRoleId: role?.parentRoleId,
    active: role?.active,
  };
};

const fixData = (data: RoleFields): RoleAttrs => {
  return {
    id: data.id,
    name: data.name,
    permissions: encodePermissions(data.permissions ?? []),
    parentRoleId: data.parentRoleId,
    active: data.active,
  };
};

const buildQuery = (id: string): ModelWhereQuery<AdminUserModel> => {
  return { id: Number(id) };
};

export async function createRole(data: RoleFields): Promise<RoleFields> {
  if (data.permissions && data.permissions.some(isInvalidPermission)) {
    throw new Error('Role has invalid permission(s)');
  }

  data.active = true;
  return createModel(RoleModel, fixData(data), buildModelFields);
}

export async function updateRole(id: string, data: RoleFields): Promise<RoleFields> {
  if (data.parentRoleId && id === String(data.parentRoleId)) {
    throw new Error('Role cannot be parent of itself');
  }

  if (data.permissions && data.permissions.some(isInvalidPermission)) {
    throw new Error('Role has invalid permission(s)');
  }

  // TODO. Validar que no haya ciclos.

  return updateModel(RoleModel, fixData(data), buildModelFields, buildQuery(id));
}

export async function countRoles(): Promise<number> {
  return countModels<RoleModel>(RoleModel);
}

export async function findRole({ roleId }: { roleId: string }): Promise<RoleFields> {
  return findModel(RoleModel, buildModelFields, buildQuery(roleId));
}

export async function findAllRoles(options: OrderingOptions): Promise<RoleFields[]> {
  return findAllModels(RoleModel, options, buildModelFields);
}
