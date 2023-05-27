import Sequelize from 'sequelize';

import { OrderingOptions } from '../../utils';
import { ALL_PERMISSIONS } from '../../consts';
import { Nullable, Optional } from '../../types';
import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import RoleModel from './roleModel';

const encodePermissions = (permissions: string[]): string => permissions.join(',');
const decodePermissions = (encoded: string): string[] => encoded.split(',');

const isInvalidPermission = (p: string) => !ALL_PERMISSIONS.includes(p);

type RoleCommonFields = {
  id: Optional<number>;
  name: Optional<string>;
  parentRoleId: Optional<number>;
  active: Optional<boolean>;
  isTeacher: Optional<boolean>;
};

export type RoleFields = RoleCommonFields & {
  permissions: Optional<string[]>;
};

export type RoleAttrs = RoleCommonFields & {
  permissions: Optional<string>;
};

const toRoleFields = (role: Nullable<RoleModel>): RoleFields => {
  return {
    id: role?.id,
    name: role?.name,
    permissions: role?.permissions ? decodePermissions(role?.permissions) : [],
    parentRoleId: role?.parentRoleId,
    active: role?.active,
    isTeacher: role?.isTeacher,
  };
};

const fixData = (data: RoleFields): RoleAttrs => {
  return {
    id: data.id,
    name: data.name,
    permissions: encodePermissions(data.permissions ?? []),
    parentRoleId: data.parentRoleId,
    active: data.active,
    isTeacher: data.isTeacher,
  };
};

const buildQuery = (id: string): Sequelize.WhereOptions<RoleModel> => {
  return { id: Number(id) };
};

export async function createRole(data: RoleFields): Promise<RoleFields> {
  if (data.permissions && data.permissions.some(isInvalidPermission)) {
    throw new Error('Role has invalid permission(s)');
  }

  const dataWithActiveField = { ...data, active: true };

  return createModel(RoleModel, fixData(dataWithActiveField), toRoleFields);
}

export async function updateRole(id: string, data: RoleFields): Promise<RoleFields> {
  if (data.parentRoleId && id === String(data.parentRoleId)) {
    throw new Error('Role cannot be parent of itself');
  }

  if (data.permissions && data.permissions.some(isInvalidPermission)) {
    throw new Error('Role has invalid permission(s)');
  }

  // TODO. Validar que no haya ciclos.

  return updateModel(RoleModel, fixData(data), toRoleFields, buildQuery(id));
}

export async function countRoles(): Promise<number> {
  return countModels<RoleModel>(RoleModel);
}

export async function findRole({ roleId }: { roleId: string }): Promise<RoleFields> {
  return findModel(RoleModel, toRoleFields, buildQuery(roleId));
}

export async function findAllRoles(options: OrderingOptions): Promise<RoleFields[]> {
  return findAllModels(RoleModel, options, toRoleFields);
}

export function isTeacherRole(role: RoleFields): boolean {
  return role.isTeacher || false;
}

// Consolida una cadena de roles en uno solo
// - Una sola lista de permisos
// - Resuelve permisos de padres

export async function consolidateRoles(
  role: RoleFields
): Promise<Omit<RoleFields, 'parentRoleId'>> {
  const allPermissions: string[] = [...(role.permissions ? role.permissions : [])];

  let targetRole = role;

  while (targetRole.parentRoleId) {
    const parent = await findRole({ roleId: String(role.parentRoleId) });

    allPermissions.push(...(parent.permissions ? parent.permissions : []));

    targetRole = parent;
  }

  return {
    ...role,
    permissions: allPermissions.filter(p => !isInvalidPermission(p)),
  };
}
