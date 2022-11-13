import Role from './adminRole';
import { isNumber, OrderingOptions } from '../../utils';

export async function createRole(
  { organization, name, year, period, subjectId }
  : { organization: string, name: string, period: Number, year: Number, subjectId: Number }
) {

  return Role.create({ active: true, githubOrganization: organization, name, year, period, subjectId });
}

export async function findAllRoles(options: OrderingOptions) {

  const paginationOptions = isNumber(options.perPage) && isNumber(options.page) ?
    { limit: options.perPage, offset: options.page * options.perPage }
    : {};

  const orderingOptions = options.sortField ? [[ options.sortField, options.sortOrder?? 'DESC' ]] : [];

  // @ts-expect-error (Tomas): Parece que para tipar esto bien hay que hacer algo como
  // keyof Role porque Sequelize (sus tipos para se exactos) no entiende
  // que el primer elemento de la lista en realidad son las keys del modelo.

  return Role.findAll({ ...paginationOptions, order: orderingOptions });
}

export async function countRoles() { return Role.count({}) };

export async function findRole({ roleId }: { roleId: string }) {

  return Role.findOne({ where: { id: Number(roleId) }});
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
  const [_, [updated]] = await Role.update(
    {
      name: attrs.name,
      githubOrganization: attrs.organization,
      subjectId: attrs.subjectId,
      period: attrs.period,
      year: attrs.year,
      active: attrs.active
    },
    {
      where: { id: Number(id) },
      returning: true
    }
  );

  return updated;
}
