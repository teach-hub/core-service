import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import GroupModel from './model';
import type { OrderingOptions } from '../../utils';

export type GroupFields = {
  id: number;
  name: string;
  courseId: number;
  active: boolean;
};

const buildModelFields = (group: GroupModel): GroupFields => {
  return {
    id: group.id,
    name: group.name,
    courseId: group.courseId,
    active: group.active,
  };
};

type FindGroupsFilter = OrderingOptions & {
  forCourseId?: GroupModel['courseId'];
  active?: boolean;
  name?: string;
};

export async function createGroup(data: GroupFields): Promise<GroupFields | null> {
  const dataWithActiveField = {
    ...data,
    active: true,
  };

  return createModel(GroupModel, dataWithActiveField, buildModelFields);
}

export async function updateGroup(id: number, data: Omit<GroupFields, 'id'>): Promise<GroupFields> {
  return updateModel(GroupModel, data, buildModelFields, { id });
}

export async function countGroups(): Promise<number> {
  return countModels<GroupModel>(GroupModel);
}

export async function findAllGroups(options: FindGroupsFilter): Promise<GroupFields[]> {
  const { forCourseId, active, name } = options;

  const whereClause = {
    ...(forCourseId ? { courseId: forCourseId } : {}),
    ...(active ? { active: active } : {}),
    ...(name ? { name: name } : {}),
  };

  return findAllModels(GroupModel, options, buildModelFields, whereClause);
}

export async function findGroup({ groupId }: { groupId: number }): Promise<GroupFields | null> {
  return findModel(GroupModel, buildModelFields, { id: groupId });
}
