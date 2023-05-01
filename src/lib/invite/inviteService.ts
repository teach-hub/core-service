import InviteModel from './model';

import { UserRoleFields, createUserRole } from '../userRole/userRoleService';

import type { UserFields } from '../user/userService';

export const buildInvite = async ({
  courseId,
  roleId,
}: {
  courseId: string;
  roleId: string;
}): Promise<InviteModel> => {
  // TODO. Validar que courseId y roleId existan.

  const invite = await InviteModel.create(
    { courseId: Number(courseId), roleId: Number(roleId) },
    { returning: true }
  );

  return invite;
};

export const markInviteAsUsed = async ({
  inviteId,
  viewer,
}: {
  inviteId: string;
  viewer: UserFields;
}): Promise<UserRoleFields> => {
  const invite = await InviteModel.findOne({ where: { id: Number(inviteId) } });

  if (!invite) {
    throw new Error('Invite not found');
  }

  const userRole = await createUserRole({
    userId: viewer.id,
    roleId: Number(invite.roleId),
    courseId: Number(invite.courseId),
    active: true,
  });

  await invite.update({ usedAt: new Date() });

  return userRole;
};
