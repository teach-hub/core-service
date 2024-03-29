export const DatabaseConstants = {
  SCHEMAS: {
    TEACH_HUB: 'teachhub',
  },
  TABLES: {
    ADMIN_USER: 'admin_users',
    SUBJECT: 'subjects',
    COURSE: 'courses',
    USER: 'users',
    ROLE: 'roles',
    USER_ROLE: 'user_roles',
    ASSIGNMENT: 'assignments',
    INVITE: 'invites',
    SUBMISSION: 'submissions',
    REPOSITORY: 'repositories',
    GROUP: 'groups',
    GROUP_PARTICIPANT: 'group_participants',
    REVIEWER: 'reviewers',
    REVIEW: 'reviews',
  },
};

/**
 * Permiso que podemos setear en un rol. Esto podria vivir
 * en el/los front tambien. Queremos hacerlo de esta forma para
 * despues poder asociar un permiso a una serie de acciones posibles.
 * Si estos permisos fuesen dinamicos despues tendriamos que
 * agregar algun flujo para asociar esos permisos a acciones posibles
 * (en ese caso las acciones estarian fixeadas).
 *
 * Disclaimer: esto podria centralizarse en algun lugar (back o front) pero
 * a falta de mejor opcion actualmente vive en ambos (backoffice + aca).
 */

export enum Permission {
  AssignReviewer = 'assignReviewer',
  CreateAssignment = 'createAssignment',
  CreateRepository = 'createRepository',
  EditAssignment = 'editAssignment',
  InviteUser = 'inviteUser',
  ManageGroups = 'manageGroups',
  ManageOwnGroups = 'manageOwnGroups',
  SendNotifications = 'sendNotifications',
  SetDescription = 'setDescription',
  SetOrganization = 'setOrganization',
  SetReview = 'setReview',
  SubmitAssignment = 'submitAssignment',
  /* View permissions are used in front-end */
  ViewAllSubmissions = 'viewAllSubmissions',
  ViewCourseCharts = 'viewCourseCharts',
}

export const ALL_PERMISSIONS: string[] = Object.values(Permission);
