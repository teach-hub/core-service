import AdminUser from '../models/adminUser';
import {isNumber, OrderingOptions} from "../utils";

export async function createAdminUser(
  { email, password, name, lastName }:
    {
      email: string,
      password: string,
      name: string,
      lastName: string
    }
) {
  return AdminUser.create({ email, password, name, lastName });
}

export async function findAllAdminUsers(options: OrderingOptions) {

  const paginationOptions = isNumber(options.perPage) && isNumber(options.page) ?
    { limit: options.perPage, offset: options.page * options.perPage }
    : {};

  const orderingOptions = options.sortField ? [[ options.sortField, options.sortOrder?? 'DESC' ]] : [];

  // @ts-expect-error (Tomas): Parece que para tipar esto bien hay que hacer algo como
  // keyof AdminUser porque Sequelize (sus tipos para se exactos) no entiende
  // que el primer elemento de la lista en realidad son las keys del modelo.

  return AdminUser.findAll({ ...paginationOptions, order: orderingOptions });
}

export async function countAdminUsers() { return AdminUser.count({}) }

export async function findAdminUser({ adminUserId }: { adminUserId: string }) {

  return AdminUser.findOne({ where: { id: Number(adminUserId) }});
}

export async function updateAdminUser(
  id: string,
  attrs: { name?: string, lastName?: string, email?: string, password?: string }
) {

  // https://sequelize.org/api/v6/class/src/model.js~model#static-method-update
  // `update` devuelve un array con los valores updateados en el segundo lugar.
  const [_, [updated]] = await AdminUser.update(
    { name: attrs.name, lastName: attrs.lastName, email: attrs.email, password: attrs.password },
    { where: { id: Number(id) }, returning: true }
  );

  return updated;
}
