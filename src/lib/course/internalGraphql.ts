import type { GraphQLFieldConfigMap } from 'graphql';
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { keyBy } from 'lodash';

import { SubjectType } from '../subject/internalGraphql';
import { RoleType } from '../role/internalGraphql';
import { getViewer, UserType } from '../user/internalGraphql';
import { AssignmentType } from '../assignment/graphql';
import { buildUserRoleType } from '../userRole/internalGraphql';
import { RepositoryType } from '../repository/internalGraphql';

import { findSubject } from '../subject/subjectService';
import { findAllAssignments, findAssignment } from '../assignment/assignmentService';
import { findAllUserRoles, findUserRoleInCourse } from '../userRole/userRoleService';
import {
  consolidateRoles,
  findAllRoles,
  findRole,
  isTeacherRole,
} from '../role/roleService';
import {
  createGroupWithParticipants,
  disableGroupIfEmpty,
  findAllGroups,
} from '../group/service';

import { fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';

import type { CourseFields } from './courseService';
import { findCourse, updateCourse } from './courseService';
import { getGithubUserOrganizationNames } from '../../github/githubUser';
import { getToken } from '../../utils/request';

import type { AuthenticatedContext } from 'src/context';
import {
  createGroupParticipant,
  findAllGroupParticipants,
  updateGroupParticipant,
} from '../groupParticipant/service';
import { InternalGroupParticipantType } from '../groupParticipant/internalGraphql';
import { InternalGroupType } from '../group/internalGraphql';
import { SubmissionType } from '../submission/internalGraphql';
import { findSubmission } from '../submission/submissionsService';
import { getViewerRepositories } from '../repository/service';

export const CoursePublicDataType: GraphQLObjectType<CourseFields, AuthenticatedContext> =
  new GraphQLObjectType({
    name: 'CoursePublicDataType',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLID),
        resolve: s => {
          return toGlobalId({
            entityName: 'course',
            dbId: String(s.id),
          });
        },
      },
      name: { type: new GraphQLNonNull(GraphQLString) },
      period: { type: new GraphQLNonNull(GraphQLInt) },
      year: { type: new GraphQLNonNull(GraphQLInt) },
      subject: {
        type: new GraphQLNonNull(SubjectType),
        description: 'Subject the course belongs to',
        resolve: async ({ subjectId }) => {
          return subjectId ? await findSubject({ subjectId }) : null;
        },
      },
    }),
  });

export const CourseType: GraphQLObjectType<CourseFields, AuthenticatedContext> =
  new GraphQLObjectType({
    name: 'CourseType',
    fields: () => {
      const UserRoleType = buildUserRoleType({
        roleType: RoleType,
        userType: UserType,
        courseType: CourseType,
      });

      return {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          resolve: s => {
            return toGlobalId({
              entityName: 'course',
              dbId: String(s.id),
            });
          },
        },
        name: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        organization: { type: GraphQLString },
        period: { type: new GraphQLNonNull(GraphQLInt) },
        year: { type: new GraphQLNonNull(GraphQLInt) },
        active: { type: new GraphQLNonNull(GraphQLBoolean) },
        viewerRole: {
          type: new GraphQLNonNull(RoleType),
          resolve: async (course, _args, context) => {
            const viewer = await getViewer(context);

            if (!course.id || !viewer?.id) {
              throw new Error('Course not found');
            }

            const userRole = await findUserRoleInCourse({
              courseId: course.id,
              userId: viewer.id,
            });
            const viewerRole = await findRole({ roleId: userRole.roleId! });

            return viewerRole && consolidateRoles(viewerRole);
          },
        },
        teachersUserRoles: {
          type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserRoleType))),
          description: 'Teacher user roles within a course',
          resolve: async (course, _, context) => {
            try {
              const courseUserRoles = await findAllUserRoles({
                forCourseId: course.id,
              });

              const allRoles = await findAllRoles({});
              const allRolesById = keyBy(allRoles, 'id');

              const teachersUserRoles = courseUserRoles.filter(
                userRole => allRolesById[userRole.roleId!].isTeacher
              );

              return teachersUserRoles;
            } catch (error) {
              context.logger.error('Failed finding teachers', error);
              return [];
            }
          },
        },
        teachersCount: {
          type: new GraphQLNonNull(GraphQLInt),
          resolve: async course => {
            const userRoles = await findAllUserRoles({ forCourseId: course.id });
            const allRoles = await findAllRoles({});

            const allRolesById = keyBy(allRoles, 'id');

            const courseRoles = userRoles
              .map(userRole => allRolesById[userRole.roleId!])
              .filter(role => isTeacherRole(role));

            return courseRoles.length;
          },
        },
        studentsCount: {
          type: new GraphQLNonNull(GraphQLInt),
          resolve: async course => {
            const userRoles = await findAllUserRoles({ forCourseId: course.id });
            const allRoles = await findAllRoles({});

            const allRolesById = keyBy(allRoles, 'id');

            const courseRoles = userRoles
              .map(userRole => allRolesById[userRole.roleId!])
              .filter(role => !isTeacherRole(role));

            return courseRoles.length;
          },
        },
        userRoles: {
          type: new GraphQLList(new GraphQLNonNull(UserRoleType)),
          description: 'User roles within a course',
          resolve: course => {
            return findAllUserRoles({ forCourseId: course.id });
          },
        },
        subject: {
          type: new GraphQLNonNull(SubjectType),
          description: 'Subject the course belongs to',
          resolve: async ({ subjectId }) => {
            const subject = subjectId ? await findSubject({ subjectId }) : null;
            return subject;
          },
        },
        assignments: {
          type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AssignmentType))),
          args: { assignmentId: { type: GraphQLID } },
          description: 'Active assignments within the course',
          resolve: async ({ id: courseId }, args, _) => {
            const { assignmentId } = args;

            if (assignmentId) {
              const fixedAssignmentId = fromGlobalIdAsNumber(args.assignmentId);
              const assignment = await findAssignment({
                assignmentId: fixedAssignmentId,
              });

              if (assignment) {
                return [assignment];
              }
              return [];
            }

            return courseId
              ? await findAllAssignments({ forCourseId: courseId, active: true })
              : [];
          },
        },
        assignment: {
          args: { id: { type: new GraphQLNonNull(GraphQLID) } },
          description: 'Finds an assignment for a specific course',
          type: AssignmentType,
          resolve: async (_, args, { logger }) => {
            const assignmentId = fromGlobalIdAsNumber(args.id);

            logger.info('Finding assignment', { assignmentId });

            return await findAssignment({ assignmentId });
          },
        },
        submission: {
          args: { id: { type: new GraphQLNonNull(GraphQLID) } },
          type: SubmissionType,
          resolve: async (_, { id }, ctx) => {
            const submissionId = fromGlobalIdAsNumber(id);
            const submission = await findSubmission({ submissionId });

            ctx.logger.info('Requested submission with id', { submission });

            if (submission) {
              const assignment = await findAssignment({
                assignmentId: submission.assignmentId,
              });

              if (!assignment) {
                throw new Error('Assignment not found');
              }

              return {
                ...submission,
                isGroup: assignment.isGroup,
              };
            }

            return submission;
          },
        },
        viewerGroupParticipants: {
          type: new GraphQLNonNull(
            new GraphQLList(new GraphQLNonNull(InternalGroupParticipantType))
          ),
          description: 'Viewer groups within the course',
          resolve: async (course, _, context) => {
            const viewer = await getViewer(context);

            if (!viewer?.id) {
              throw new Error('Viewer not found');
            }

            const userRole = await findUserRoleInCourse({
              courseId: course.id,
              userId: viewer.id,
            });

            return await findAllGroupParticipants({
              forUserRoleId: userRole.id,
            });
          },
        },
        groups: {
          type: new GraphQLNonNull(
            new GraphQLList(new GraphQLNonNull(InternalGroupType))
          ),
          description: 'Groups within a course',
          resolve: async course => {
            return await findAllGroups({
              forCourseId: course.id,
            });
          },
        },
        viewerRepositories: {
          type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RepositoryType))),
          resolve: async (course, _, context) => {
            if (!context.viewerUserId) {
              return [];
            }

            // Por mas que los repositorios sean por assignment nosotros lo dejamos global
            // al curso para que puedan re-utilizarse en distintos assignments.

            try {
              return getViewerRepositories({
                courseId: course.id,
                viewerUserId: context.viewerUserId,
              });
            } catch (e) {
              context.logger.error('Failed fetching repositories', { error: e });
              return [];
            }
          },
        },
      };
    },
  });

export const courseMutations: GraphQLFieldConfigMap<null, AuthenticatedContext> = {
  setOrganization: {
    type: CourseType,
    description: 'Sets the github organization of a course',
    args: {
      organizationName: {
        type: new GraphQLNonNull(GraphQLString),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve: async (_: unknown, args: unknown, context: AuthenticatedContext) => {
      const token = getToken(context);
      if (!token) throw new Error('Token required');

      // @ts-expect-error: FIXME
      const { organizationName, courseId: encodedCourseId } = args;

      const courseId = fromGlobalIdAsNumber(encodedCourseId);

      const availableOrganizations = await getGithubUserOrganizationNames(token);

      if (!availableOrganizations.includes(organizationName)) {
        throw new Error(
          `Organization ${organizationName} does not belong to current user`
        );
      }

      context.logger.info(
        `Setting organization ${organizationName} for course ${courseId}`
      );

      const currentCourseData = await findCourse({ courseId });

      if (!currentCourseData) {
        throw new Error(`Course ${courseId} not found`);
      }

      const courseFields = {
        ...currentCourseData,
        organization: organizationName,
      };

      return await updateCourse(courseId, courseFields);
    },
  },
  setDescription: {
    type: CourseType,
    description: 'Sets the description of a course',
    args: {
      description: {
        type: new GraphQLNonNull(GraphQLString),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve: async (_, args, context: AuthenticatedContext) => {
      if (!context.viewerUserId) throw new Error('User not authenticated');

      const { description, courseId: encodedCourseId } = args;

      const courseId = fromGlobalIdAsNumber(encodedCourseId);

      context.logger.info(`Setting course ${courseId} description`);

      const currentCourseData = await findCourse({ courseId });

      if (!currentCourseData) {
        throw new Error(`Course ${courseId} not found`);
      }

      const courseFields = {
        ...currentCourseData,
        description,
      };

      return await updateCourse(courseId, courseFields);
    },
  },
  createGroupWithParticipant: {
    type: CourseType,
    description: 'Creates a group and adds a participant to it',
    args: {
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      assignmentId: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve: async (_, args, context) => {
      if (!context.viewerUserId) {
        throw new Error('User not authenticated');
      }

      const { assignmentId: encodedAssignmentId, courseId: encodedCourseId } = args;

      const assignmentId = fromGlobalIdAsNumber(encodedAssignmentId);
      const courseId = fromGlobalIdAsNumber(encodedCourseId);

      const userRole = await findUserRoleInCourse({
        courseId,
        userId: context.viewerUserId,
      });

      context.logger.info(
        `Creating group with for assignment ${assignmentId} for user ${context.viewerUserId}`
      );

      const createdGroup = await createGroupWithParticipants({
        courseId,
        assignmentId,
        membersUserRoleIds: [userRole.id],
      });

      return findCourse({ courseId: createdGroup.courseId });
    },
  },
  joinGroup: {
    type: CourseType,
    description: 'Joins viewer to a group',
    args: {
      groupId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      assignmentId: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve: async (_, args, context) => {
      if (!context.viewerUserId) {
        throw new Error('User not authenticated');
      }

      const {
        assignmentId: encodedAssignmentId,
        groupId: encodedGroupId,
        courseId: encodedCourseId,
      } = args;

      const assignmentId = fromGlobalIdAsNumber(encodedAssignmentId);
      const groupId = fromGlobalIdAsNumber(encodedGroupId);
      const courseId = fromGlobalIdAsNumber(encodedCourseId);

      await validateGroupOnJoin({ assignmentId });

      const userRole = await findUserRoleInCourse({
        courseId,
        userId: context.viewerUserId,
      });

      context.logger.info(
        `Joining group ${groupId} for assignment ${assignmentId} for user ${context.viewerUserId}`
      );

      const assignmentGroups = await findAllGroups({ forAssignmentId: assignmentId });

      const userAssignmentGroupParticipants = await findAllGroupParticipants({
        forUserRoleId: userRole.id,
        forGroupIds: assignmentGroups.map(g => g.id),
      });

      if (!userAssignmentGroupParticipants.length) {
        context.logger.info('Creating group participant for user', { userRole, groupId });

        // User has no group participant. Let's create one.
        await createGroupParticipant({
          groupId,
          userRoleId: userRole.id,
          active: true,
        });
      } else {
        if (userAssignmentGroupParticipants.length > 1) {
          throw new Error('User has more than group in assignment');
        }

        const [currentGroupParticipant] = userAssignmentGroupParticipants;

        context.logger.info('Updating group participant for user', { userRole, groupId });

        const previousGroupId = currentGroupParticipant.groupId;

        await updateGroupParticipant(currentGroupParticipant.id, {
          groupId,
          userRoleId: userRole.id,
          active: true,
        });

        await disableGroupIfEmpty({ groupId: previousGroupId });
      }

      return findCourse({ courseId });
    },
  },
};

const validateGroupOnJoin = async ({ assignmentId }: { assignmentId: number }) => {
  const assignment = await findAssignment({ assignmentId });
  if (!assignment?.isGroup) {
    throw new Error('Assignment is not a group assignment');
  }
};
