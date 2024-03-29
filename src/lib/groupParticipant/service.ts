import { Transaction, Op } from 'sequelize';

import {
  countModels,
  createModel,
  destroyModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import GroupParticipantModel from './model';

import type { OrderingOptions } from '../../utils';

export type GroupParticipantFields = {
  id: number;
  groupId: number;
  userRoleId: number;
  active: boolean;
};

const buildModelFields = (
  groupParticipant: GroupParticipantModel
): GroupParticipantFields => {
  return {
    id: groupParticipant.id,
    groupId: groupParticipant.groupId,
    userRoleId: groupParticipant.userRoleId,
    active: groupParticipant.active,
  };
};

export async function createGroupParticipant(
  data: Omit<GroupParticipantFields, 'id'>,
  t?: Transaction
): Promise<GroupParticipantFields | null> {
  const dataWithActiveField = {
    ...data,
    active: true,
  };

  return createModel(GroupParticipantModel, dataWithActiveField, buildModelFields, t);
}

export async function deleteGroupParticipants(
  filters: FindGroupParticipantFilters,
  t?: Transaction
): Promise<number> {
  const { groupParticipantId } = filters;

  const whereClause = {
    ...(groupParticipantId ? { id: groupParticipantId } : {}),
  };

  return destroyModel(GroupParticipantModel, whereClause, t);
}

export async function updateGroupParticipant(
  id: number,
  data: Omit<GroupParticipantFields, 'id'>
): Promise<GroupParticipantFields> {
  return updateModel(GroupParticipantModel, data, buildModelFields, { id });
}

export async function countGroupParticipants(): Promise<number> {
  return countModels<GroupParticipantModel>(GroupParticipantModel);
}

type FindGroupParticipantsFilter = OrderingOptions & {
  forGroupId?: GroupParticipantModel['groupId'];
  forGroupIds?: GroupParticipantModel['groupId'][];
  forUserRoleId?: GroupParticipantModel['userRoleId'];
  forUserRoleIds?: GroupParticipantModel['userRoleId'][];
  active?: boolean;
};

export async function findAllGroupParticipants(
  options: FindGroupParticipantsFilter,
  t?: Transaction
): Promise<GroupParticipantFields[]> {
  const { forGroupId, forGroupIds, forUserRoleId, forUserRoleIds, active } = options;

  const whereClause = {
    ...(forGroupId ? { groupId: forGroupId } : {}),
    ...(forGroupIds ? { groupId: { [Op.in]: forGroupIds } } : {}),
    ...(forUserRoleId ? { userRoleId: forUserRoleId } : {}),
    ...(forUserRoleIds ? { userRoleId: { [Op.in]: forUserRoleIds } } : {}),
    ...(active ? { active } : {}),
  };

  return findAllModels(GroupParticipantModel, options, buildModelFields, whereClause, t);
}

type FindGroupParticipantFilters = {
  groupParticipantId?: GroupParticipantModel['id'];
  forUserRoleId?: GroupParticipantModel['userRoleId'];
  forGroupId?: number;
  active?: boolean;
};

export async function findGroupParticipant({
  groupParticipantId,
  forUserRoleId,
  forGroupId,
}: FindGroupParticipantFilters): Promise<GroupParticipantFields | null> {
  const whereClause = {
    ...(forUserRoleId ? { userRoleId: forUserRoleId } : {}),
    ...(forGroupId ? { groupId: forGroupId } : {}),
    ...(groupParticipantId ? { id: groupParticipantId } : {}),
  };

  return findModel(GroupParticipantModel, buildModelFields, whereClause);
}
