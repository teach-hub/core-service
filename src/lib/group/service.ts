import { db } from '../../db';
import { Transaction } from 'sequelize';
import { sortBy, uniq } from 'lodash';
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
  deleteGroupParticipants,
  findAllGroupParticipants,
} from '../groupParticipant/service';

import GroupModel from './model';
import type { OrderingOptions } from '../../utils';
import logger from '../../logger';

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
  onlyActiveGroups?: boolean;
  active?: boolean;
  ignoreActiveFilter?: boolean;
  name?: string;
};

export async function createGroup(
  data: Omit<GroupFields, 'id' | 'active'>,
  t?: Transaction
): Promise<GroupFields | null> {
  const dataWithActiveField = {
    ...data,
    active: true,
  };

  return createModel(GroupModel, dataWithActiveField, buildModelFields, t);
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

/**
 * Finds all groups that match the given filters.
 * By default, only active groups are returned
 * */
export async function findAllGroups(
  options: FindGroupsFilter,
  t?: Transaction
): Promise<GroupFields[]> {
  const { forCourseId, forAssignmentId, name, onlyActiveGroups } = options;

  const whereClause = {
    ...(forCourseId ? { courseId: forCourseId } : {}),
    ...(forAssignmentId ? { assignmentId: forAssignmentId } : {}),
    ...(onlyActiveGroups === false ? {} : { active: true }), // By default, only search active groups
    ...(name ? { name: name } : {}),
  };

  return findAllModels(
    GroupModel,
    { sortOrder: 'DESC', sortField: 'id' },
    buildModelFields,
    whereClause,
    t
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
  const { courseId, assignmentId, membersUserRoleIds } = createParams;

  if (!membersUserRoleIds.length) {
    throw new Error('No members provided');
  }

  const targetAssignment = await findAssignment({ assignmentId });

  if (!targetAssignment?.isGroup) {
    throw new Error('Assignment is not a group assignment');
  }

  const createdGroup = await db.transaction(async t => {
    // Nos aseguramos que los participants no pertenezcan a otro grupo.
    const courseGroups = await findAllGroups(
      {
        forCourseId: courseId,
        onlyActiveGroups: false,
      },
      t
    );

    // Buscamos el mas reciente (id mas alto).
    const [latestGroup] = sortBy(courseGroups, instance => -instance.id);

    const assignmentGroups = courseGroups.filter(g => g.assignmentId === assignmentId);

    const userGroupParticipantsToDelete = assignmentGroups.length
      ? await findAllGroupParticipants(
          {
            forUserRoleIds: membersUserRoleIds,
            forGroupIds: assignmentGroups.map(g => g.id),
          },
          t
        )
      : [];

    if (userGroupParticipantsToDelete.length) {
      await Promise.all(
        userGroupParticipantsToDelete.map(gp =>
          deleteGroupParticipants({ groupParticipantId: gp.id }, t)
        )
      );
      await Promise.all(
        /* Get distinct group ids and disable each of them, if they end up empty */
        uniq(userGroupParticipantsToDelete.map(gp => gp.groupId)).map(groupId =>
          disableGroupIfEmpty({ groupId })
        )
      );
    }

    const nextName = latestGroup
      ? `Grupo ${Number(latestGroup.name.split(' ')[1]) + 1}`
      : 'Grupo 1';

    const group = await createGroup(
      {
        name: nextName,
        courseId,
        assignmentId,
      },
      t
    );

    if (!group) {
      throw new Error('Error creating group');
    }

    await Promise.all(
      membersUserRoleIds.map(async userRoleId =>
        createGroupParticipant(
          {
            userRoleId,
            groupId: group.id,
            active: true,
          },
          t
        )
      )
    );

    return group;
  });

  return createdGroup;
}

/**
 * Searches for the group with the given id and disables it (sets active to falsE)
 * if has no participants left in it.
 * */
export const disableGroupIfEmpty = async ({ groupId }: { groupId: number }) => {
  const groupParticipants = await findAllGroupParticipants({ forGroupId: groupId });
  if (!groupParticipants.length) {
    const group = await findGroup({ groupId });
    if (group) {
      logger.info(`Disabling group ${groupId}`);
      await updateGroup(groupId, { ...group, active: false });
    }
  }
};
