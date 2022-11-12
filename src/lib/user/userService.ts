import User from './userModel';

import { isNumber, OrderingOptions } from '../../utils';

export async function createUser(
  { name, lastName, file, githubId, notificationEmail }:
  { name: string, lastName: string, file: string, githubId: string, notificationEmail: string }
) {
  return User.create({  name, lastName, file, githubId, notificationEmail, active: true });
}

export async function findAllUsers(options: OrderingOptions) {

  const paginationOptions = isNumber(options.perPage) && isNumber(options.page) ?
    { limit: options.perPage, offset: options.page * options.perPage }
    : {};

  const orderingOptions = options.sortField ? [[ options.sortField, options.sortOrder?? 'DESC' ]] : [];

  // @ts-expect-error (Tomas): Parece que para tipar esto bien hay que hacer algo como
  // keyof User porque Sequelize (sus tipos para se exactos) no entiende
  // que el primer elemento de la lista en realidad son las keys del modelo.

  return User.findAll({ ...paginationOptions, order: orderingOptions });
}

export async function countUsers() { return User.count({}) };

export async function findUser({ userId }: { userId: string }) {

  return User.findOne({ where: { id: Number(userId) }});
}

export async function updateUser(
  id: string,
  attrs: {
    name?: string,
    lastName?: string,
    githubId?: string,
    notificationEmail?: string
    active?: boolean,
    file?: string
  }
) {

  // https://sequelize.org/api/v6/class/src/model.js~model#static-method-update
  // `update` devuelve un array con los valores updateados en el segundo lugar.
  const [_, [updated]] = await User.update(
    {
      name: attrs.name,
      lastName: attrs.lastName,
      githubId: attrs.githubId,
      active: attrs.active,
      file: attrs.file,
      notificationEmai: attrs.notificationEmail
    },
    { where: { id: Number(id) }, returning: true }
  );

  return updated;
}
