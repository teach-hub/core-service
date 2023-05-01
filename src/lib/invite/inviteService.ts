import InviteModel from './model';

import { createUserRole } from '../userRole/userRoleService';

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
  viewer: any;
}) => {
  const invite = await InviteModel.findOne({ where: { id: Number(inviteId) } });

  if (!invite) {
    throw new Error('Invite not found');
  }

  // @ts-expect-error
  await createUserRole({
    userId: viewer.id,
    roleId: invite.roleId,
    courseId: invite.courseId,
  });

  await invite.update({ usedAt: new Date() });
};
