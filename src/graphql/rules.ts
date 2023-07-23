import { allow, deny, or, rule, shield } from 'graphql-shield';

import { getViewer } from '../lib/user/internalGraphql';

import { consolidateRoles, findRole } from '../lib/role/roleService';
import type { CourseFields } from '../lib/course/courseService';
import { findCourse } from '../lib/course/courseService';
import type { UserRoleFields } from '../lib/userRole/userRoleService';
import { findAllUserRoles } from '../lib/userRole/userRoleService';

import { fromGlobalId } from './utils';
import type { UserFields } from '../lib/user/userService';
import type { Context } from 'src/types';

import { Permission } from '../consts';

const buildRule: ReturnType<typeof rule> = fn =>
  rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
    try {
      return await fn(parent, args, ctx, info);
    } catch (e) {
      ctx.logger.error('An error was raised while evaluating rule', e);
      return false;
    }
  });

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

  ctx.logger.info(`Checking if viewer is teacher in course ${courseId}`);

  const [viewerUserRole] = await findAllUserRoles({
    forCourseId: courseId,
    forUserId: viewer.id,
  });

  const viewerRole = await findRole({ roleId: String(viewerUserRole.roleId) });

  if (!viewerRole) {
    return false;
  }

  return viewerRole.isTeacher!;
}

async function viewerBelongsToCourse(courseId: CourseFields['id'], context: Context) {
  const viewer = await getViewer(context);

  context.logger.info(`Checking if viewer belongs to course ${courseId}`);

  const viewerUserRoles = await findAllUserRoles({
    forCourseId: courseId,
    forUserId: viewer.id,
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
      getViewer(context),
      findCourse({ courseId }),
    ]);

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
 * -- Atencion: Los argumentos que recibimos aca no pasan
 * por las functiones `fromGlobalId` por lo que nos toca
 * tener esa logica en las reglas que lo necesiten.
 */
export default shield<null, Context, unknown>(
  {
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
    CreateSubmissionResultType: allow,
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
      createRepositories: viewerHasPermissionInCourse(Permission.CreateRepository),
      createSubmission: viewerHasPermissionInCourse(Permission.SubmitAssignment),
      // TODO. Agregar courseId a la mutation.
      // assignReviewers: viewerHasPermissionInCourse(Permission.AssignReviewer),
      createGroupWithParticipant: viewerHasPermissionInCourse(Permission.ManageOwnGroups),
      joinGroup: viewerHasPermissionInCourse(Permission.ManageOwnGroups),
    },
  },
  { debug: true }
);
