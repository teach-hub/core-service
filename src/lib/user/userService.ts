import UserModel from './userModel';

import { isNumber, OrderingOptions } from '../../utils';

type User = {
  id?: number;
  name?: string;
  lastName?: string;
  file?: string;
  githubId?: string;
  notificationEmail?: string;
  active?: boolean;
}

export async function createUser (
  { name, lastName, file, githubId, notificationEmail }: User
): Promise<UserModel> {
  return UserModel.create({  name, lastName, file, githubId, notificationEmail, active: true });
}

export async function findAllUsers(options: OrderingOptions): Promise<UserModel[]> {

  const paginationOptions = isNumber(options.perPage) && isNumber(options.page) ?
    { limit: options.perPage, offset: options.page * options.perPage }
    : {};

  const orderingOptions = options.sortField ? [[ options.sortField, options.sortOrder?? 'DESC' ]] : [];

  // @ts-expect-error (Tomas): Parece que para tipar esto bien hay que hacer algo como
  // keyof User porque Sequelize (sus tipos para se exactos) no entiende
  // que el primer elemento de la lista en realidad son las keys del modelo.

  return UserModel.findAll({ ...paginationOptions, order: orderingOptions });
}

export async function countUsers(): Promise<number> { return UserModel.count({}) };

export async function findUser({ userId }: { userId: string }): Promise<UserModel | null> {

  const id = Number(userId);

  return UserModel.findOne({ where: { id }});
}

export async function updateUser(
  id: string,
  attrs: User
): Promise<UserModel> {

  // https://sequelize.org/api/v6/class/src/model.js~model#static-method-update
  // `update` devuelve un array con los valores updateados en el segundo lugar.
  const [_, [updated]] = await UserModel.update(
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
