import Subject from '../models/subject';

type Options = {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}

function isNumber (x: any): x is number {
  return Number.isInteger(x);
}

export async function createSubject({ name, code }: { name: string, code: string }) {
  return Subject.create({ name, code });
}

export async function findAllSubjects(options: Options) {

  const paginationOptions = isNumber(options.perPage) && isNumber(options.page) ?
    { limit: options.perPage, offset: options.page * options.perPage }
    : {};

  const orderingOptions = options.sortField ? [[ options.sortField, options.sortOrder?? 'DESC' ]] : [];

  // @ts-expect-error XXX FIXME

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
