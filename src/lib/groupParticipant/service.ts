import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import GroupParticipantModel from './model';
import type { OrderingOptions } from '../../utils';
import type { Nullable, Optional } from '../../types';
import { Op } from 'sequelize';

export type GroupParticipantFields = {
  id: Optional<number>;
  assignmentId: Optional<number>;
  groupId: Optional<number>;
  userRoleId: Optional<number>;
  active: Optional<boolean>;
};

const buildModelFields = (
  groupParticipant: Nullable<GroupParticipantModel>
): GroupParticipantFields => {
  return {
    id: groupParticipant?.id,
    assignmentId: groupParticipant?.assignmentId,
    groupId: groupParticipant?.groupId,
    userRoleId: groupParticipant?.userRoleId,
    active: groupParticipant?.active,
  };
};

type FindGroupParticipantsFilter = OrderingOptions & {
  forAssignmentId?: GroupParticipantModel['assignmentId'];
  forGroupId?: GroupParticipantModel['groupId'];
  forGroupIds?: GroupParticipantModel['groupId'][];
  forUserRoleId?: GroupParticipantModel['userRoleId'];
  active?: boolean;
};

export async function createGroupParticipant(
  data: GroupParticipantFields
): Promise<GroupParticipantFields> {
  const dataWithActiveField = {
    ...data,
    active: true,
  };

  return createModel(GroupParticipantModel, dataWithActiveField, buildModelFields);
}

export async function updateGroupParticipant(
  id: string,
  data: GroupParticipantFields
): Promise<GroupParticipantFields> {
  return updateModel(GroupParticipantModel, data, buildModelFields, {
    id: Number(id),
  });
}

export async function countGroupParticipants(): Promise<number> {
  return countModels<GroupParticipantModel>(GroupParticipantModel);
}

export async function findAllGroupParticipants(
  options: FindGroupParticipantsFilter
): Promise<GroupParticipantFields[]> {
  const { forGroupId, forGroupIds, forUserRoleId, forAssignmentId, active } = options;

  const whereClause = {
    ...(forAssignmentId ? { assignmentId: forAssignmentId } : {}),
    ...(forGroupId ? { groupId: forGroupId } : {}),
    ...(forGroupIds ? { groupId: { [Op.in]: forGroupIds } } : {}),
    ...(forUserRoleId ? { userRoleId: forUserRoleId } : {}),
    ...(active ? { active } : {}),
  };

  return findAllModels(GroupParticipantModel, options, buildModelFields, whereClause);
}

type FindGroupParticipantFilters = {
  groupParticipantId?: string;
  forAssignmentId?: GroupParticipantModel['assignmentId'];
  forUserRoleId?: GroupParticipantModel['userRoleId'];
  active?: boolean;
};

export async function findGroupParticipant({
  groupParticipantId,
  forAssignmentId,
  forUserRoleId,
}: FindGroupParticipantFilters): Promise<GroupParticipantFields> {
  const whereClause = {
    ...(forUserRoleId ? { userRoleId: forUserRoleId } : {}),
    ...(forAssignmentId ? { assignmentId: forAssignmentId } : {}),
    ...(groupParticipantId ? { id: Number(groupParticipantId) } : {}),
  };

  return findModel(GroupParticipantModel, buildModelFields, whereClause);
}
