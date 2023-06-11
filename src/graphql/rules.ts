import { IRule, shield, rule, deny, allow, or } from 'graphql-shield';

import { getViewer } from '../lib/user/internalGraphql';

import { findRole } from '../lib/role/roleService';
import { findCourse } from '../lib/course/courseService';
import { findAllUserRoles } from '../lib/userRole/userRoleService';

import type { UserRoleFields } from '../lib/userRole/userRoleService';
import type { CourseFields } from '../lib/course/courseService';
import type { UserFields } from '../lib/user/userService';
import type { Context } from 'src/types';

import { Permission } from '../consts';

const buildRule: ReturnType<typeof rule> = fn => {
  return rule({ cache: 'contextual' })(fn);
};

async function viewerIsUserRoleOwner(
  userRole: UserRoleFields,
  _: unknown,
  ctx: Context
): Promise<boolean> {
  const viewer = await getViewer(ctx);

  if (!viewer) {
    return false;
  }

  ctx.logger.info(`Checking if viewer is owner of user role with ID ${userRole.id}`);

  return userRole.userId === viewer.id;
}

async function viewerIsCourseTeacher(
  courseId: CourseFields['id'],
  ctx: Context
): Promise<boolean> {
  const viewer = await getViewer(ctx);

  const viewerUserRoles = await findAllUserRoles({
    forCourseId: courseId,
    forUserId: viewer.id,
  });

  const viewerRoles = await Promise.all(
    viewerUserRoles.map(ur => findRole({ roleId: String(ur.roleId) }))
  );

  return viewerRoles.some(r => r.isTeacher);
}

async function userHasPermissionInCourse({
  user,
  course,
  permission,
}: {
  user: UserFields;
  course: CourseFields;
  permission: Permission;
}): Promise<boolean> {
  const userUserRoles = await findAllUserRoles({
    forCourseId: course.id,
    forUserId: user.id,
  });

  const userRoles = await Promise.all(
    userUserRoles.map(ur => findRole({ roleId: String(ur.roleId) }))
  );

  return userRoles.some(
    role => (role.permissions ?? []).includes(permission) || role.isTeacher
  );
}

const viewerHasPermissionInCourse = (permission: Permission) =>
  rule({ cache: 'contextual' })(async (_, args, context) => {
    const viewer = await getViewer(context);
    const course = await findCourse({ courseId: args.courseId });

    if (!course) {
      return false;
    }

    context.logger.info(`Checking if viewer has permission in ${course.name}`);

    return userHasPermissionInCourse({ user: viewer, course, permission });
  });

/**
 * Cuando seteamos permisos sobre una mutation tenemos que tener
 * en cuenta los campos que se devuelven.
 *
 * Por ejemplo la mutation `updateUser` devuelve un `UserType`
 * entonces para poder "ver" el resultado de la mutation
 * los permisos que tenga la mutation `updateUser` tienen que ser
 * por lo menos los de `UserType`.
 *
 */
export default shield<null, Context, unknown>({
  ViewerType: allow,
  UserRoleType: or(
    buildRule(viewerIsUserRoleOwner),
    buildRule(async (userRole, _, ctx) => {
      console.log(`Checking if viewer is user in ${userRole.courseId}`);

      return await viewerIsCourseTeacher(userRole.courseId, ctx);
    })
  ),
  AssignmentType: allow,
  CourseType: buildRule((course, _, context) =>
    viewerIsCourseTeacher(course.id, context)
  ),
  RoleType: allow,
  UserType: allow,
  SubjectType: allow,
  RootMutationType: {
    registerUser: allow,
    /**
     * Todavia no tenemos caso de uso para
     * esta mutation.
     */
    updateUser: deny,
    login: allow,
    logout: allow,
    useInvite: allow,
    createAssignment: viewerHasPermissionInCourse(Permission.CreateAssignment),
    updateAssignment: viewerHasPermissionInCourse(Permission.EditAssignment),
    setOrganization: viewerHasPermissionInCourse(Permission.SetOrganization),
    generateInviteCode: viewerHasPermissionInCourse(Permission.InviteUser),
  },
});
