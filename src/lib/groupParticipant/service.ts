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
  const { forGroupId, forUserRoleId, forAssignmentId, active } = options;

  const whereClause = {
    ...(forAssignmentId ? { assignmentId: forAssignmentId } : {}),
    ...(forGroupId ? { groupId: forGroupId } : {}),
    ...(forUserRoleId ? { userRoleId: forUserRoleId } : {}),
    ...(active ? { active: active } : {}),
  };

  return findAllModels(GroupParticipantModel, options, buildModelFields, whereClause);
}

export async function findGroupParticipant({
  groupParticipantId,
}: {
  groupParticipantId: string;
}): Promise<GroupParticipantFields> {
  return findModel(GroupParticipantModel, buildModelFields, {
    id: Number(groupParticipantId),
  });
}
