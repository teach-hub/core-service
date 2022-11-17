import RoleModel from './roleModel';
import { isNumber, OrderingOptions } from '../../utils';

const encodePermissions = (permissions: string[]) => permissions.join('.');
const decodePermissions = (encoded: string) => encoded.split('.');

export async function createRole(
  { name, permissions, parentRoleId }
  : { name: string, permissions: string[], parentRoleId: string }
) {

  return RoleModel.create({
    name,
    active: true,
    permissions: encodePermissions(permissions),
    parentRoleId
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
    organization?: string,
    subjectId?: number,
    period?: number,
    year?: number,
    active?: boolean,
  }
) {

  // https://sequelize.org/api/v6/class/src/model.js~model#static-method-update
  // `update` devuelve un array con los valores updateados en el segundo lugar.
  const [_, [updated]] = await RoleModel.update(
    {
      name: attrs.name,
      permissions: decodePermissions(attrs.permissions),
      parentRoleId: attrs.parentRoleId,
      active: attrs.active,
    },
    {
      where: { id: Number(id) },
      returning: true
    }
  );

  return updated;
}
