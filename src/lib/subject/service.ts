import Subject from './model';
import { isNumber, OrderingOptions } from '../../utils';

export async function createSubject({ name, code }: { name: string, code: string }) {
  return Subject.create({ name, code });
}

export async function findAllSubjects(options: OrderingOptions) {

  const paginationOptions = isNumber(options.perPage) && isNumber(options.page) ?
    { limit: options.perPage, offset: options.page * options.perPage }
    : {};

  const orderingOptions = options.sortField ? [[ options.sortField, options.sortOrder?? 'DESC' ]] : [];

  // @ts-expect-error (Tomas): Parece que para tipar esto bien hay que hacer algo como
  // keyof Subject porque Sequelize (sus tipos para se exactos) no entiende
  // que el primer elemento de la lista en realidad son las keys del modelo.

  return Subject.findAll({ ...paginationOptions, order: orderingOptions });
}

export async function countSubjects() { return Subject.count({}) };

export async function findSubject({ subjectId }: { subjectId: string }) {

  return Subject.findOne({ where: { id: Number(subjectId) }});
}

export async function updateSubject(id: string, attrs: { name?: string, code?: string }) {

  // https://sequelize.org/api/v6/class/src/model.js~model#static-method-update
  // `update` devuelve un array con los valores updateados en el segundo lugar.
  const [_, [updated]] = await Subject.update(
    { name: attrs.name, code: attrs.code },
    { where: { id: Number(id) }, returning: true }
  );

  return updated;
}
