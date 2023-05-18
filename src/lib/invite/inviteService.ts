import InviteModel from './model';

import { UserRoleFields, createUserRole } from '../userRole/userRoleService';
import { findRole } from '../role/roleService';
import { findCourse } from '../course/courseService';

import type { UserFields } from '../user/userService';

export const buildInvite = async ({
  courseId,
  roleId,
}: {
  courseId: string;
  roleId: string;
}): Promise<InviteModel> => {
  const [role, course] = await Promise.all([
    findRole({ roleId }),
    findCourse({ courseId }),
  ]);

  if (!role.id || !course.id) {
    throw new Error('Role or course not found');
  }

  const invite = await InviteModel.create({
    courseId: Number(courseId),
    roleId: Number(roleId),
  });

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
    roleId: invite.roleId,
    courseId: invite.courseId,
    active: true,
  });

  await invite.update({ usedAt: new Date() });

  return userRole;
};
