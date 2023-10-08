import Subject from './subjectModel';

import {
  countModels,
  createModel,
  existsModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import type { OrderingOptions } from '../../utils';
import type { WhereOptions } from 'sequelize';

type SubjectFields = {
  id: number;
  name: string;
  code: string;
  active: boolean;
};

const buildModelFields = (subject: Subject): SubjectFields => {
  return {
    id: subject.id,
    name: subject.name,
    code: subject.code,
    active: subject.active,
  };
};

const buildQuery = (id: number): WhereOptions<Subject> => {
  return { id };
};

const validate = async (data: SubjectFields) => {
  let previousSubject = null;
  if (data.id) {
    previousSubject = await findModel(Subject, buildModelFields, buildQuery(data.id));
  }

  if (previousSubject?.code !== data.code) {
    const codeAlreadyUsed = await existsModel(Subject, {
      code: data.code,
    });

    if (codeAlreadyUsed) throw new Error('Code is already used');
  }

  if (previousSubject?.name !== data.name) {
    const nameAlreadyUsed = await existsModel(Subject, {
      name: data.name,
    });
    if (nameAlreadyUsed) throw new Error('Name is already used');
  }
};

export async function createSubject(data: SubjectFields): Promise<SubjectFields | null> {
  const dataWithActiveField = { ...data, active: true };

  await validate(dataWithActiveField);

  return createModel(Subject, dataWithActiveField, buildModelFields);
}

export async function updateSubject(
  id: number,
  data: Omit<SubjectFields, 'id'>
): Promise<SubjectFields> {
  await validate({ ...data, id });
  return updateModel(Subject, data, buildModelFields, buildQuery(id));
}

export const countSubjects = async (): Promise<number> => countModels<Subject>(Subject);

export const findSubject = async ({
  subjectId,
}: {
  subjectId: number;
}): Promise<SubjectFields | null> =>
  findModel(Subject, buildModelFields, buildQuery(subjectId));

export const findAllSubjects = async (
  options: OrderingOptions
): Promise<SubjectFields[]> => findAllModels(Subject, options, buildModelFields);
