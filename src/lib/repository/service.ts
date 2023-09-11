import {
  bulkCreateModel,
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import RepositoryModel from './model';
import type { OrderingOptions } from '../../utils';
import type { Nullable, Optional } from '../../types';

export type RepositoryFields = {
  id: Optional<number>;
  courseId: Optional<number>;
  userId: Optional<number>;
  groupId: Optional<number>;
  name: Optional<string>;
  githubId: Optional<number>;
  active: Optional<boolean>;
};

const buildModelFields = (repository: Nullable<RepositoryModel>): RepositoryFields => {
  return {
    id: repository?.id,
    courseId: repository?.courseId,
    userId: repository?.courseId,
    groupId: repository?.groupId,
    name: repository?.name,
    githubId: repository?.githubId,
    active: repository?.active,
  };
};

type FindRepositoriesFilter = OrderingOptions & {
  active?: boolean;
  forUserId?: number;
  forGroupId?: number;
  forCourseId?: number;
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

export async function bulkCreateRepository(
  repositoriesData: RepositoryFields[]
): Promise<RepositoryFields[]> {
  const dataWithActiveFieldList = repositoriesData.map(data => {
    return {
      ...data,
      active: true,
    };
  });

  return bulkCreateModel(RepositoryModel, dataWithActiveFieldList, buildModelFields);
}

export async function updateRepository(
  id: number,
  data: Omit<RepositoryFields, 'id'>
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
  const { active, forUserId, forCourseId, forGroupId } = options;

  const whereClause = {
    ...(active ? { active } : {}),
    ...(forUserId ? { userId: forUserId } : {}),
    ...(forCourseId ? { courseId: forCourseId } : {}),
    ...(forGroupId ? { courseId: forGroupId } : {}),
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
