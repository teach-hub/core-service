import Subject from './subjectModel';
import { OrderingOptions } from '../../utils';
import { IModelFields, ModelAttributes, ModelWhereQuery } from '../../sequelize/types';
import { Nullable, Optional } from '../../types';
import {
  countModels,
  createModel,
  existsModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

interface SubjectFields extends IModelFields, ModelAttributes<Subject> {
  name: Optional<string>;
  code: Optional<string>;
  active: Optional<boolean>;
}

const buildModelFields = (subject: Nullable<Subject>): SubjectFields => {
  return {
    id: subject?.id,
    name: subject?.name,
    code: subject?.code,
    active: subject?.active,
  };
};

const buildQuery = (id: string): ModelWhereQuery<Subject> => {
  return { id: Number(id) };
};

const fixData = (data: SubjectFields) => {
  data.githubOrganization = data.organization;
  return data;
};

const validate = async (data: SubjectFields) => {
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
  data.active = true; // Always create active
  await validate(data);
  return createModel(Subject, fixData(data), buildModelFields);
}

export async function updateSubject(
  id: string,
  data: SubjectFields
): Promise<SubjectFields> {
  await validate(data);
  return updateModel(Subject, fixData(data), buildModelFields, buildQuery(id));
}

export async function countSubjects(): Promise<number> {
  return countModels<Subject>(Subject);
}

export async function findSubject({
  subjectId,
}: {
  subjectId: string;
}): Promise<SubjectFields> {
  return findModel(Subject, buildModelFields, buildQuery(subjectId));
}

export async function findAllSubjects(
  options: OrderingOptions
): Promise<SubjectFields[]> {
  return findAllModels(Subject, options, buildModelFields);
}
