import { shield, rule, deny, allow } from 'graphql-shield';

import { getViewer } from '../lib/user/internalGraphql';

import { findRole } from '../lib/role/roleService';
import { findAllUserRoles } from '../lib/userRole/userRoleService';

import type { UserRoleFields } from '../lib/userRole/userRoleService';
import type { CourseFields } from '../lib/course/courseService';
import type { UserFields } from '../lib/user/userService';
import type { Context } from 'src/types';

const isUserRoleOwner = rule({ cache: 'contextual' })(
  async (userRole: UserRoleFields, _, ctx: Context): Promise<boolean> => {
    const viewer = await getViewer(ctx);

    ctx.logger.info(`Checking if viewer is owner of user role with ID ${userRole.id}`);

    return userRole.userId === viewer.id;
  }
);

const isCourseTeacher = rule({ cache: 'contextual' })(
  async (course: CourseFields, _, ctx: Context): Promise<boolean> => {
    const viewer = await getViewer(ctx);

    ctx.logger.info(`Checking if viewer is teacher in '${course.name}'`);

    const viewerUserRoles = await findAllUserRoles({
      forCourseId: course.id,
      forUserId: viewer.id,
    });

    const viewerRoles = await Promise.all(
      viewerUserRoles.map(ur => findRole({ roleId: String(ur.roleId) }))
    );

    return viewerRoles.some(r => r.isTeacher);
  }
);

const userIsViewer = rule({ cache: 'contextual' })(
  async (user: UserFields, _, ctx: Context): Promise<boolean> => {
    const viewer = await getViewer(ctx);

    ctx.logger.info('Checking if user is viewer');

    return user.id === viewer.id;
  }
);

const permissionsMiddleware = shield<null, Context, unknown>({
  ViewerType: allow,
  AssignmentType: allow,
  CourseType: isCourseTeacher,
  RoleType: allow,
  UserRoleType: isUserRoleOwner,
  UserType: userIsViewer,
  SubjectType: allow,
  RootMutationType: {
    '*': deny,
  },
});

export default permissionsMiddleware;
