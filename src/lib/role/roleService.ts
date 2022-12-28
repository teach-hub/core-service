import RoleModel from './roleModel';
import { isNumber, OrderingOptions } from '../../utils';
import { ALL_PERMISSIONS } from '../../consts';

const encodePermissions = (permissions: string[]): string => permissions.join(',');
const decodePermissions = (encoded: string): string[] => encoded.split(',');

const isInvalidPermission = (p: string) => !ALL_PERMISSIONS.includes(p)

export async function createRole(
  { name, permissions, parentRoleId }
  : { name: string, permissions: string[], parentRoleId?: string }
) {

  if (permissions.some(isInvalidPermission)) {
    throw new Error('Role has invalid permission(s)');
  }

  const created = await RoleModel.create({
    name,
    active: true,
    permissions: encodePermissions(permissions),
    parentRoleId: parentRoleId ? Number(parentRoleId): null,
  });

  return {
    id: created.id,
    name: created.name,
    permissions: decodePermissions(created.permissions),
    parentRoleId: created.parentRoleId,
    active: created.active,
  }
}


export async function findAllRoles(options: OrderingOptions) {

  const paginationOptions = isNumber(options.perPage) && isNumber(options.page) ?
    { limit: options.perPage, offset: options.page * options.perPage }
    : {};

  const orderingOptions = options.sortField ? [[ options.sortField, options.sortOrder?? 'DESC' ]] : [];

  // @ts-expect-error (Tomas): Parece que para tipar esto bien hay que hacer algo como
  // keyof Role porque Sequelize (sus tipos para se exactos) no entiende
  // que el primer elemento de la lista en realidad son las keys del modelo.

  const roles = await RoleModel.findAll({ ...paginationOptions, order: orderingOptions });

  return roles.map(role => {
    return {
      id: role?.id,
      name: role?.name,
      permissions: decodePermissions(role?.permissions ?? ''),
      parentRoleId: role?.parentRoleId,
      active: role?.active,
    }
  })
}

export async function countRoles() { return RoleModel.count({}) };

export async function findRole({ roleId }: { roleId: string }) {
  const role =  await RoleModel.findOne({ where: { id: Number(roleId) }});

  return {
    id: role?.id,
    name: role?.name,
    permissions: decodePermissions(role?.permissions ?? ''),
    parentRoleId: role?.parentRoleId,
    active: role?.active,
  }
}

export async function updateRole(
  id: string,
  attrs: {
    name?: string,
    permissions: string[],
    parentRoleId?: string,
    active?: boolean,
  }
) {

  if (id === attrs.parentRoleId) {
    throw new Error('Role cannot be parent of itself')
  }

  if (attrs.permissions.some(isInvalidPermission)) {
    throw new Error('Role has invalid permission(s)')
  }

  // TODO. Validar que no haya ciclos.

  const [_, [updated]] = await RoleModel.update(
    {
      name: attrs.name,
      permissions: encodePermissions(attrs.permissions),
      parentRoleId: attrs.parentRoleId ? attrs.parentRoleId: null,
      active: attrs.active,
    },
    {
      where: { id: Number(id) },
      returning: true
    }
  );

  return {
    id: updated.id,
    name: updated.name,
    permissions: decodePermissions(updated.permissions ?? ''),
    parentRoleId: updated.parentRoleId,
    active: updated.active,
  }
}
