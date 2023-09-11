import type Sequelize from 'sequelize';

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
import type { Nullable, Optional } from '../../types';

type SubjectFields = {
  id: Optional<number>;
  name: Optional<string>;
  code: Optional<string>;
  active: Optional<boolean>;
};

const buildModelFields = (subject: Nullable<Subject>): SubjectFields => {
  return {
    id: subject?.id,
    name: subject?.name,
    code: subject?.code,
    active: subject?.active,
  };
};

const buildQuery = (id: number): Sequelize.WhereOptions<Subject> => {
  return { id };
};

const validate = async (data: Omit<SubjectFields, 'id'>) => {
  const codeAlreadyUsed = await existsModel(Subject, {
    code: data.code,
  });

  if (codeAlreadyUsed) throw new Error('Code is already used');
  const nameAlreadyUsed = await existsModel(Subject, {
    name: data.name,
  });

  if (nameAlreadyUsed) throw new Error('Name is already used');
};

export async function createSubject(data: SubjectFields): Promise<SubjectFields> {
  const dataWithActiveField = { ...data, active: true };

  await validate(dataWithActiveField);

  return createModel(Subject, dataWithActiveField, buildModelFields);
}

export async function updateSubject(
  id: number,
  data: Omit<SubjectFields, 'id'>
): Promise<SubjectFields> {
  await validate(data);
  return updateModel(Subject, data, buildModelFields, buildQuery(id));
}

export const countSubjects = async (): Promise<number> => countModels<Subject>(Subject);

export const findSubject = async ({
  subjectId,
}: {
  subjectId: number;
}): Promise<SubjectFields> => findModel(Subject, buildModelFields, buildQuery(subjectId));

export const findAllSubjects = async (
  options: OrderingOptions
): Promise<SubjectFields[]> => findAllModels(Subject, options, buildModelFields);
