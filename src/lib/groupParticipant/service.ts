import { Op } from 'sequelize';

import {
  countModels,
  createModel,
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
  data: Omit<GroupParticipantFields, 'id'>
): Promise<GroupParticipantFields | null> {
  const dataWithActiveField = {
    ...data,
    active: true,
  };

  return createModel(GroupParticipantModel, dataWithActiveField, buildModelFields);
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
  // forAssignmentId?: GroupParticipantModel['assignmentId'];
  forGroupId?: GroupParticipantModel['groupId'];
  forGroupIds?: GroupParticipantModel['groupId'][];
  forUserRoleId?: GroupParticipantModel['userRoleId'];
  active?: boolean;
};

export async function findAllGroupParticipants(
  options: FindGroupParticipantsFilter
): Promise<GroupParticipantFields[]> {
  const { forGroupId, forGroupIds, forUserRoleId, active } = options;

  const whereClause = {
    ...(forGroupId ? { groupId: forGroupId } : {}),
    ...(forGroupIds ? { groupId: { [Op.in]: forGroupIds } } : {}),
    ...(forUserRoleId ? { userRoleId: forUserRoleId } : {}),
    ...(active ? { active } : {}),
  };

  return findAllModels(GroupParticipantModel, options, buildModelFields, whereClause);
}

type FindGroupParticipantFilters = {
  groupParticipantId?: GroupParticipantModel['id'];
  forUserRoleId?: GroupParticipantModel['userRoleId'];
  active?: boolean;
};

export async function findGroupParticipant({
  groupParticipantId,
  forUserRoleId,
}: FindGroupParticipantFilters): Promise<GroupParticipantFields | null> {
  const whereClause = {
    ...(forUserRoleId ? { userRoleId: forUserRoleId } : {}),
    ...(groupParticipantId ? { id: groupParticipantId } : {}),
  };

  return findModel(GroupParticipantModel, buildModelFields, whereClause);
}
