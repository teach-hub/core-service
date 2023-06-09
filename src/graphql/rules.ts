import { shield, rule, deny } from 'graphql-shield';

import { getViewer } from '../lib/user/internalGraphql';

import type { UserRoleFields } from '../lib/userRole/userRoleService';
import type { CourseFields } from '../lib/course/courseService';
import type { UserFields } from '../lib/user/userService';
import type { Context } from 'src/types';

const isUserRoleOwner = rule({ cache: 'contextual' })(
  async (userRole: UserRoleFields, _, ctx: Context): Promise<boolean> => {
    const viewer = await getViewer(ctx);

    ctx.logger.info('Checking viewer');

    return userRole.userId === viewer.id;
  }
);

const isCourseTeacher = rule({ cache: 'contextual' })(
  async (course: CourseFields, _, ctx: Context): Promise<boolean> => {
    const viewer = await getViewer(ctx);

    return true;
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
  ViewerType: rule()(() => true),
  AssignmentType: rule()(() => true),
  CourseType: isCourseTeacher,
  RoleType: rule()(() => true),
  UserRoleType: isUserRoleOwner,
  UserType: userIsViewer,
  SubjectType: rule()(() => true),
  RootMutationType: {
    '*': deny,
  },
});

export default permissionsMiddleware;
