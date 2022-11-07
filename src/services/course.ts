import Course from '../models/course';

type Options = {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}

function isNumber (x: any): x is number {
  return Number.isInteger(x);
}

export async function createCourse(
  { githubOrganization, name, year, period, subjectId }
  : { githubOrganization: string, name: string, period: Number, year: Number, subjectId: Number }
) {

  return Course.create({ active: true, githubOrganization, name, year, period, subject_id: subjectId });
}

export async function findAllCourses(options: Options) {

  const paginationOptions = isNumber(options.perPage) && isNumber(options.page) ?
    { limit: options.perPage, offset: options.page * options.perPage }
    : {};

  const orderingOptions = options.sortField ? [[ options.sortField, options.sortOrder?? 'DESC' ]] : [];

  // @ts-expect-error (Tomas): Parece que para tipar esto bien hay que hacer algo como
  // keyof Course porque Sequelize (sus tipos para se exactos) no entiende
  // que el primer elemento de la lista en realidad son las keys del modelo.

  return Course.findAll({ ...paginationOptions, order: orderingOptions });
}

export async function countCourses() { return Course.count({}) };

export async function findCourse({ courseId }: { courseId: string }) {

  return Course.findOne({ where: { id: Number(courseId) }});
}

export async function updateCourse(
  id: string,
  attrs: {
    name?: string,
    githubOrganization?: string,
    subjectId?: number,
    period?: number,
    year?: number,
    active?: boolean,
  }
) {

  // https://sequelize.org/api/v6/class/src/model.js~model#static-method-update
  // `update` devuelve un array con los valores updateados en el segundo lugar.
  const [_, [updated]] = await Course.update(
    {
      name: attrs.name,
      githubOrganization: attrs.githubOrganization,
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
