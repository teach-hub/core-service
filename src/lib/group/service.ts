import { sortBy } from 'lodash';
import {
  countModels,
  createModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import { findAssignment } from '../assignment/assignmentService';
import {
  createGroupParticipant,
  findAllGroupParticipants,
  deleteGroupParticipants,
} from '../groupParticipant/service';

import GroupModel from './model';
import type { OrderingOptions } from '../../utils';

export type GroupFields = {
  id: number;
  name: string;
  assignmentId: number;
  courseId: number;
  active: boolean;
};

const buildModelFields = (group: GroupModel): GroupFields => {
  return {
    id: group.id,
    name: group.name,
    courseId: group.courseId,
    assignmentId: group.assignmentId,
    active: group.active,
  };
};

type FindGroupsFilter = OrderingOptions & {
  forCourseId?: GroupModel['courseId'];
  forAssignmentId?: GroupModel['assignmentId'];
  active?: boolean;
  name?: string;
};

export async function createGroup(
  data: Omit<GroupFields, 'id' | 'active'>
): Promise<GroupFields | null> {
  const dataWithActiveField = {
    ...data,
    active: true,
  };

  return createModel(GroupModel, dataWithActiveField, buildModelFields);
}

export async function updateGroup(
  id: number,
  data: Omit<GroupFields, 'id'>
): Promise<GroupFields> {
  return updateModel(GroupModel, data, buildModelFields, { id });
}

export async function countGroups(): Promise<number> {
  return countModels<GroupModel>(GroupModel);
}

export async function findAllGroups(options: FindGroupsFilter): Promise<GroupFields[]> {
  const { forCourseId, forAssignmentId, active, name } = options;

  const whereClause = {
    ...(forCourseId ? { courseId: forCourseId } : {}),
    ...(forAssignmentId ? { assignmentId: forAssignmentId } : {}),
    ...(active ? { active: active } : {}),
    ...(name ? { name: name } : {}),
  };

  return findAllModels(
    GroupModel,
    { sortOrder: 'DESC', sortField: 'id' },
    buildModelFields,
    whereClause
  );
}

export async function findGroup({
  groupId,
}: {
  groupId: number;
}): Promise<GroupFields | null> {
  return findModel(GroupModel, buildModelFields, { id: groupId });
}

type CreateGroupParams = {
  courseId: number;
  assignmentId: number;
  membersUserRoleIds: number[];
};

export async function createGroupWithParticipants(
  createParams: CreateGroupParams
): Promise<GroupFields> {
  // TODO. Usar una transaccion.
  const { courseId, assignmentId, membersUserRoleIds } = createParams;

  if (!membersUserRoleIds.length) {
    throw new Error('No members provided');
  }

  const targetAssignment = await findAssignment({ assignmentId });

  if (!targetAssignment?.isGroup) {
    throw new Error('Assignment is not a group assignment');
  }

  // Nos aseguramos que los participants no pertenezcan a otro grupo.
  const courseGroups = await findAllGroups({ forCourseId: courseId });

  // Buscamos el mas reciente (id mas alto).
  const [latestGroup] = sortBy(courseGroups, instance => -instance.id);

  const assignmentGroups = courseGroups.filter(g => g.assignmentId === assignmentId);

  const userGroupParticipantsToDelete = assignmentGroups.length
    ? await findAllGroupParticipants({
        forUserRoleIds: membersUserRoleIds,
        forGroupIds: assignmentGroups.map(g => g.id),
      })
    : [];

  if (userGroupParticipantsToDelete.length) {
    await Promise.all(
      userGroupParticipantsToDelete.map(gp =>
        deleteGroupParticipants({ groupParticipantId: gp.id })
      )
    );
  }

  const nextName = latestGroup
    ? `Grupo ${Number(latestGroup.name.split(' ')[1]) + 1}`
    : 'Grupo 1';

  const group = await createGroup({
    name: nextName,
    courseId,
    assignmentId,
  });

  if (!group) {
    throw new Error('Error creating group');
  }

  await Promise.all(
    membersUserRoleIds.map(async userRoleId =>
      createGroupParticipant({
        userRoleId,
        groupId: group.id,
        active: true,
      })
    )
  );

  return group;
}
