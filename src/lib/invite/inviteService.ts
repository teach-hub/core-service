import InviteModel from './model';
import { findRole } from '../role/roleService';
import { findCourse } from '../course/courseService';

export const buildInvite = async ({
  courseId,
  roleId,
  expirationMinutes,
}: {
  courseId: number;
  roleId: number;
  expirationMinutes?: number;
}): Promise<InviteModel> => {
  const [role, course] = await Promise.all([
    findRole({ roleId }),
    findCourse({ courseId }),
  ]);

  if (!role || !course) {
    throw new Error('Role or course not found');
  }

  const expiresAt = expirationMinutes
    ? new Date(Date.now() + expirationMinutes * 60000) // Convert minutes to milliseconds
    : undefined;

  return await InviteModel.create({
    courseId,
    roleId,
    expiresAt: expiresAt,
  });
};
