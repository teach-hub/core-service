import Sequelize from 'sequelize';

import { OrderingOptions } from '../../utils';
import { ALL_PERMISSIONS, Permission } from '../../consts';
import { Nullable, Optional } from '../../types';
import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import RoleModel from './roleModel';

const encodePermissions = (permissions: Permission[]): string => permissions.join(',');
const decodePermissions = (encoded: string): Permission[] => {
  return encoded.split(',').map(x => {
    const p = x.trim();
    if (!isValidPermission(p)) throw new Error('Invalid permission');
    return p;
  });
};

const isValidPermission = (p: Permission | string): p is Permission =>
  ALL_PERMISSIONS.includes(p);

type RoleCommonFields = {
  id: number;
  name: string;
  parentRoleId: Optional<number>;
  active: boolean;
  isTeacher: Optional<boolean>;
};

export type RoleFields = RoleCommonFields & {
  permissions: Permission[];
};

export type RoleAttrs = RoleCommonFields & {
  permissions: string;
};

const toRoleFields = (role: RoleModel): RoleFields => {
  return {
    id: role.id,
    name: role.name,
    permissions: role.permissions ? decodePermissions(role.permissions) : [],
    parentRoleId: role.parentRoleId,
    active: role.active,
    isTeacher: role.isTeacher,
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

const buildQuery = (id: number): Sequelize.WhereOptions<RoleModel> => {
  return { id };
};

export async function createRole(data: RoleFields): Promise<RoleFields | null> {
  if (data.permissions && data.permissions.some(x => !isValidPermission(x))) {
    throw new Error('Role has invalid permission(s)');
  }

  const dataWithActiveField = { ...data, active: true };

  return createModel(RoleModel, fixData(dataWithActiveField), toRoleFields);
}

export async function updateRole(id: number, data: RoleFields): Promise<RoleFields> {
  if (data.parentRoleId && Number(id) === Number(data.parentRoleId)) {
    throw new Error('Role cannot be parent of itself');
  }

  if (data.permissions && data.permissions.some(x => !isValidPermission(x))) {
    throw new Error('Role has invalid permission(s)');
  }

  // TODO. Validar que no haya ciclos.

  return updateModel(RoleModel, fixData(data), toRoleFields, buildQuery(id));
}

export async function countRoles(): Promise<number> {
  return countModels<RoleModel>(RoleModel);
}

export async function findRole({ roleId }: { roleId: number }): Promise<RoleFields | null> {
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

  let targetRole: RoleFields | null = role;

  while (targetRole?.parentRoleId) {
    const parent: RoleFields | null = await findRole({ roleId: targetRole.parentRoleId });

    allPermissions.push(...(parent?.permissions ? parent.permissions : []));

    targetRole = parent;
  }

  return {
    ...role,
    permissions: allPermissions.filter(isValidPermission),
  };
}
