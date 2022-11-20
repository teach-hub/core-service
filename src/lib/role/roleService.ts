import RoleModel from './roleModel';
import { isNumber, OrderingOptions } from '../../utils';
import { ALL_PERMISSIONS } from '../../consts';

const encodePermissions = (permissions: string[]) => permissions.join('.');
const decodePermissions = (encoded: string) => encoded.split('.');

export async function createRole(
  { name, permissions, parentRoleId }
  : { name: string, permissions: string, parentRoleId?: string }
) {

  if (!ALL_PERMISSIONS.includes(permissions?? '')) {
    throw new Error('Invalid permission')
  }

  return RoleModel.create({
    name,
    active: true,
    permissions: permissions,
    parentRoleId: parentRoleId? Number(parentRoleId): null,
  });
}

export async function findAllRoles(options: OrderingOptions) {

  const paginationOptions = isNumber(options.perPage) && isNumber(options.page) ?
    { limit: options.perPage, offset: options.page * options.perPage }
    : {};

  const orderingOptions = options.sortField ? [[ options.sortField, options.sortOrder?? 'DESC' ]] : [];

  // @ts-expect-error (Tomas): Parece que para tipar esto bien hay que hacer algo como
  // keyof Role porque Sequelize (sus tipos para se exactos) no entiende
  // que el primer elemento de la lista en realidad son las keys del modelo.

  return RoleModel.findAll({ ...paginationOptions, order: orderingOptions });
}

export async function countRoles() { return RoleModel.count({}) };

export async function findRole({ roleId }: { roleId: string }) {
  return RoleModel.findOne({ where: { id: Number(roleId) }});
}

export async function updateRole(
  id: string,
  attrs: {
    name?: string,
    permissions?: string,
    parentRoleId?: string,
    active?: boolean,
  }
) {

  if (id === attrs.parentRoleId) {
    throw new Error('Role cannot be parent of itself')
  }

  if (!ALL_PERMISSIONS.includes(attrs.permissions?? '')) {
    throw new Error('Invalid permission')
  }

  // TODO.
  // Validar que no haya ciclos.

  const [_, [updated]] = await RoleModel.update(
    {
      name: attrs.name,
      permissions: attrs.permissions,
      parentRoleId: attrs.parentRoleId? attrs.parentRoleId: null,
      active: attrs.active,
    },
    {
      where: { id: Number(id) },
      returning: true
    }
  );

  return updated;
}
