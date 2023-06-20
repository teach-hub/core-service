import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import RepositoryModel from './repositoryModel';
import type { OrderingOptions } from '../../utils';
import type { Nullable, Optional } from '../../types';

export type RepositoryFields = {
  id: Optional<number>;
  courseId: Optional<number>;
  userId: Optional<number>;
  name: Optional<string>;
  githubId: Optional<number>;
  active: Optional<boolean>;
};

const buildModelFields = (repository: Nullable<RepositoryModel>): RepositoryFields => {
  return {
    id: repository?.id,
    courseId: repository?.courseId,
    userId: repository?.courseId,
    name: repository?.name,
    githubId: repository?.githubId,
    active: repository?.active,
  };
};

type FindRepositoriesFilter = OrderingOptions & {
  active?: boolean;
};

export async function createRepository(
  data: RepositoryFields
): Promise<RepositoryFields> {
  const dataWithActiveField = {
    ...data,
    active: true,
  };

  return createModel(RepositoryModel, dataWithActiveField, buildModelFields);
}

export async function updateRepository(
  id: string,
  data: RepositoryFields
): Promise<RepositoryFields> {
  return updateModel(RepositoryModel, data, buildModelFields, {
    id: Number(id),
  });
}

export async function countRepositories(): Promise<number> {
  return countModels<RepositoryModel>(RepositoryModel);
}

export async function findAllRepositories(
  options: FindRepositoriesFilter
): Promise<RepositoryFields[]> {
  const { active } = options;

  const whereClause = {
    ...(active ? { active: active } : {}),
  };

  return findAllModels(RepositoryModel, options, buildModelFields, whereClause);
}

export async function findRepository({
  repositoryId,
}: {
  repositoryId: string;
}): Promise<RepositoryFields> {
  return findModel(RepositoryModel, buildModelFields, { id: Number(repositoryId) });
}
