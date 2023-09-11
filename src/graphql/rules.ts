import { allow, chain, or, rule, shield } from 'graphql-shield';

import { buildUnauthorizedError } from '../utils/request';

import { consolidateRoles, findRole } from '../lib/role/roleService';
import type { CourseFields } from '../lib/course/courseService';
import { findCourse } from '../lib/course/courseService';
import type { UserRoleFields } from '../lib/userRole/userRoleService';
import { findAllUserRoles } from '../lib/userRole/userRoleService';

import { fromGlobalId } from './utils';
import { findUser, UserFields } from '../lib/user/userService';

import { Permission } from '../consts';

import { isDevEnv } from '../utils';
import { isContextAuthenticated, Context } from '../context';

const buildRule: ReturnType<typeof rule> = fn =>
  rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
    try {
      console.log(`Executing rule for ${info.fieldName}`);
      return await fn(parent, args, ctx, info);
    } catch (e) {
      ctx.logger.error('An error was raised while evaluating rule', e);
      throw e;
    }
  });

async function viewerIsUserRoleOwner(
  userRole: UserRoleFields,
  _: unknown,
  ctx: Context
): Promise<boolean> {
  if (!isContextAuthenticated(ctx)) {
    throw buildUnauthorizedError();
  }

  ctx.logger.info(`Checking if viewer is owner of user role with ID ${userRole.id}`);

  return userRole.userId === ctx.viewerUserId;
}

async function viewerIsCourseTeacher(
  courseId: CourseFields['id'],
  ctx: Context
): Promise<boolean> {
  if (!isContextAuthenticated(ctx)) {
    throw buildUnauthorizedError();
  }

  ctx.logger.info(`Checking if viewer is teacher in course ${courseId}`);

  const [viewerUserRole] = await findAllUserRoles({
    forCourseId: courseId,
    forUserId: ctx.viewerUserId,
  });

  const viewerRole = await findRole({ roleId: String(viewerUserRole.roleId) });

  if (!viewerRole) {
    return false;
  }

  return !!viewerRole.isTeacher;
}

async function viewerBelongsToCourse(courseId: CourseFields['id'], context: Context) {
  if (!isContextAuthenticated(context)) {
    throw buildUnauthorizedError();
  }

  context.logger.info(`Checking if viewer belongs to course ${courseId}`);

  const viewerUserRoles = await findAllUserRoles({
    forCourseId: courseId,
    forUserId: context.viewerUserId,
  });

  return !!viewerUserRoles.length;
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
  const [userUserRole] = await findAllUserRoles({
    forCourseId: course.id,
    forUserId: user.id,
  });

  if (!userUserRole) {
    return false;
  }

  const userRole = await findRole({ roleId: String(userUserRole.roleId) });

  const { permissions } = await consolidateRoles(userRole);
  return (permissions ?? []).includes(permission);
}

const viewerHasPermissionInCourse = (permission: Permission) =>
  buildRule(async (_, args, context) => {
    const { dbId: courseId } = fromGlobalId(args.courseId);

    const [viewer, course] = await Promise.all([
      findUser(context.viewerUserId),
      findCourse({ courseId }),
    ]);

    if (!course || !viewer) {
      return false;
    }

    context.logger.info(
      `Checking if viewer has permission ${permission} in ${course.name}`
    );

    return userHasPermissionInCourse({ user: viewer, course, permission });
  });

// Este mecanismo podria moverse a las mutations.
// Por ahora lo dejo aca porque es mas facil de implementar
// pero podriamos tener una function `buildAuthenticatedMutation`
// que se encargue de ver que el viewer este y si no lanzar error.

const isAuthenticated = buildRule((_, __, context) => {
  if (!isContextAuthenticated(context)) {
    throw buildUnauthorizedError();
  }

  return true;
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
 * -- Atencion: Los argumentos que recibimos aca no pasan
 * por las functiones `fromGlobalId` por lo que nos toca
 * tener esa logica en las reglas que lo necesiten.
 */
export default shield<null, Context, unknown>(
  {
    RootQueryType: allow,
    CoursePublicDataType: allow,
    ViewerType: allow,
    UserRoleType: or(
      buildRule(viewerIsUserRoleOwner),
      buildRule(
        async (userRole, _, ctx) => await viewerIsCourseTeacher(userRole.courseId, ctx)
      ),
      buildRule(
        async (userRole, _, ctx) => await viewerBelongsToCourse(userRole.courseId, ctx)
      )
    ),
    CourseType: buildRule(
      async (course, _, context) => await viewerBelongsToCourse(course.id, context)
    ),
    RoleType: allow,
    UserType: allow,
    SubjectType: allow,
    AssignmentType: allow,
    SubmissionType: allow,
    ReviewerPreviewType: allow,
    ReviewerType: allow,
    InternalGroupType: allow,
    RepositoryType: allow,
    RootMutationType: {
      registerUser: allow,
      login: allow,
      useInvite: allow,
      logout: isAuthenticated,
      updateViewerUser: isAuthenticated, // Allow each viewer to update its user
      createAssignment: chain(
        isAuthenticated,
        viewerHasPermissionInCourse(Permission.CreateAssignment)
      ),
      updateAssignment: chain(
        isAuthenticated,
        viewerHasPermissionInCourse(Permission.EditAssignment)
      ),
      setOrganization: chain(
        isAuthenticated,
        viewerHasPermissionInCourse(Permission.SetOrganization)
      ),
      generateInviteCode: chain(
        isAuthenticated,
        viewerHasPermissionInCourse(Permission.InviteUser)
      ),
      createRepositories: chain(
        isAuthenticated,
        viewerHasPermissionInCourse(Permission.CreateRepository)
      ),
      createSubmission: chain(
        isAuthenticated,
        viewerHasPermissionInCourse(Permission.SubmitAssignment)
      ),
      assignReviewers: chain(
        isAuthenticated,
        viewerHasPermissionInCourse(Permission.AssignReviewer)
      ),
      createGroupWithParticipant: chain(
        isAuthenticated,
        viewerHasPermissionInCourse(Permission.ManageOwnGroups)
      ),
      joinGroup: chain(
        isAuthenticated,
        viewerHasPermissionInCourse(Permission.ManageOwnGroups)
      ),
      createGroupWithParticipants: chain(
        isAuthenticated,
        viewerHasPermissionInCourse(Permission.ManageGroups)
      ),
      createReview: chain(
        isAuthenticated,
        viewerHasPermissionInCourse(Permission.SetReview)
      ),
      updateReview: chain(
        isAuthenticated,
        viewerHasPermissionInCourse(Permission.SetReview)
      ),
    },
  },
  {
    debug: isDevEnv(),
  }
);
