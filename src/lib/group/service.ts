import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import GroupModel from './model';
import type { OrderingOptions } from '../../utils';
import type { Nullable, Optional } from '../../types';

export type GroupFields = {
  id: Optional<number>;
  name: Optional<string>;
  courseId: Optional<number>;
  active: Optional<boolean>;
};

const buildModelFields = (group: Nullable<GroupModel>): GroupFields => {
  return {
    id: group?.id,
    name: group?.name,
    courseId: group?.courseId,
    active: group?.active,
  };
};

type FindGroupsFilter = OrderingOptions & {
  forCourseId?: GroupModel['courseId'];
  active?: boolean;
};

export async function createGroup(data: GroupFields): Promise<GroupFields> {
  const dataWithActiveField = {
    ...data,
    active: true,
  };

  return createModel(GroupModel, dataWithActiveField, buildModelFields);
}

export async function updateGroup(id: string, data: GroupFields): Promise<GroupFields> {
  return updateModel(GroupModel, data, buildModelFields, {
    id: Number(id),
  });
}

export async function countGroups(): Promise<number> {
  return countModels<GroupModel>(GroupModel);
}

export async function findAllGroups(options: FindGroupsFilter): Promise<GroupFields[]> {
  const { forCourseId, active } = options;

  const whereClause = {
    ...(forCourseId ? { courseId: forCourseId } : {}),
    ...(active ? { active: active } : {}),
  };

  return findAllModels(GroupModel, options, buildModelFields, whereClause);
}

export async function findGroup({ groupId }: { groupId: string }): Promise<GroupFields> {
  return findModel(GroupModel, buildModelFields, { id: Number(groupId) });
}
