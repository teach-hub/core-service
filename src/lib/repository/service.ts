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
import type { Optional } from '../../types';
import { Op } from 'sequelize';
import { findUserRoleInCourse } from '../userRole/userRoleService';
import { findAllGroupParticipants } from '../groupParticipant/service';
import logger from '../../logger';

export type RepositoryFields = {
  id: number;
  courseId: number;
  userId: number;
  groupId: Optional<number>;
  name: string;
  githubId: number;
  active: boolean;
};

const buildModelFields = (repository: RepositoryModel): RepositoryFields => {
  return {
    id: repository.id,
    courseId: repository.courseId,
    userId: repository.courseId,
    groupId: repository.groupId,
    name: repository.name,
    githubId: repository.githubId,
    active: repository.active,
  };
};

type FindRepositoriesFilter = OrderingOptions & {
  active?: boolean;
  forUserId?: number;
  forGroupIds?: number[];
  forCourseId?: number;
};

export async function createRepository(
  data: RepositoryFields
): Promise<RepositoryFields | null> {
  const dataWithActiveField = {
    ...data,
    active: true,
  };

  return createModel(RepositoryModel, dataWithActiveField, buildModelFields);
}

export async function bulkCreateRepository(
  repositoriesData: Omit<RepositoryFields, 'id'>[]
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
  const { active, forUserId, forCourseId, forGroupIds } = options;

  const whereClause = {
    ...(active ? { active } : {}),
    ...(forUserId ? { userId: forUserId } : {}),
    ...(forCourseId ? { courseId: forCourseId } : {}),
    ...(forGroupIds ? { groupId: { [Op.in]: forGroupIds } } : {}),
  };

  return findAllModels(RepositoryModel, options, buildModelFields, whereClause);
}

export async function findRepository({
  repositoryId,
}: {
  repositoryId: number;
}): Promise<RepositoryFields | null> {
  return findModel(RepositoryModel, buildModelFields, { id: repositoryId });
}

export const getViewerRepositories = async ({
  courseId,
  viewerUserId,
}: {
  courseId: number;
  viewerUserId: number;
}) => {
  const viewerUserRole = await findUserRoleInCourse({
    courseId: courseId,
    userId: viewerUserId,
  });
  const viewerGroupParticipants = await findAllGroupParticipants({
    forUserRoleId: viewerUserRole.id,
  });

  const individualRepositoriesFilter = {
    forUserId: viewerUserId,
    forCourseId: courseId,
  };

  const viewerGroupIds = viewerGroupParticipants.map(
    groupParticipant => groupParticipant.groupId
  );
  const viewerHasGroups = !!viewerGroupIds.length;

  const groupRepositoriesFilter = {
    forGroupIds: viewerGroupIds,
    forCourseId: courseId,
  };

  logger.info('Searching repositories', {
    filters: { ...individualRepositoriesFilter, ...groupRepositoriesFilter },
  });

  const [individualRepositories, groupRepositories] = await Promise.all([
    findAllRepositories(individualRepositoriesFilter),
    viewerHasGroups ? findAllRepositories(groupRepositoriesFilter) : [],
  ]);

  return individualRepositories.concat(groupRepositories);
};
