import {
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { keyBy } from 'lodash';

import { SubjectType } from '../subject/internalGraphql';
import { RoleType } from '../role/internalGraphql';
import { UserType } from '../user/internalGraphql';
import { AssignmentType } from '../assignment/graphql';
import { buildUserRoleType } from '../userRole/internalGraphql';
import { getViewer } from '../user/internalGraphql';

import { findSubject } from '../subject/subjectService';
import { findAllAssignments, findAssignment } from '../assignment/assignmentService';
import { findUserRoleInCourse, findAllUserRoles } from '../userRole/userRoleService';
import {
  consolidateRoles,
  findRole,
  isTeacherRole,
  findAllRoles,
} from '../role/roleService';

import { fromGlobalId, toGlobalId } from '../../graphql/utils';

import type { Context } from 'src/types';
import type { CourseFields } from './courseService';
import { findCourse, updateCourse } from './courseService';
import { getGithubUserOrganizationNames } from '../../github/githubUser';
import { getToken } from '../../utils/request';

export const CourseType: GraphQLObjectType<CourseFields, Context> = new GraphQLObjectType(
  {
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
              dbId: String(s.id) as string,
            });
          },
        },
        name: { type: new GraphQLNonNull(GraphQLString) },
        organization: { type: GraphQLString },
        period: { type: new GraphQLNonNull(GraphQLInt) },
        year: { type: new GraphQLNonNull(GraphQLInt) },
        active: { type: new GraphQLNonNull(GraphQLBoolean) },
        viewerRole: {
          type: new GraphQLNonNull(RoleType),
          resolve: async (course, _args, context) => {
            const viewer = await getViewer(context);

            if (!course.id || !viewer.id) {
              throw new Error('Course not found');
            }

            const userRole = await findUserRoleInCourse({
              courseId: course.id,
              userId: viewer.id,
            });
            const viewerRole = await findRole({ roleId: String(userRole.roleId) });

            return consolidateRoles(viewerRole);
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
          type: new GraphQLList(UserRoleType),
          description: 'User roles within a course',
          resolve: course => {
            return findAllUserRoles({ forCourseId: course.id });
          },
        },
        subject: {
          type: new GraphQLNonNull(SubjectType),
          description: 'Subject the course belongs to',
          resolve: async ({ subjectId }) => {
            const subject = subjectId
              ? await findSubject({ subjectId: String(subjectId) })
              : null;
            return subject;
          },
        },
        assignments: {
          type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AssignmentType))),
          description: 'Active assignments within the course',
          resolve: async ({ id: courseId }) => {
            return courseId
              ? await findAllAssignments({ forCourseId: courseId, active: true })
              : [];
          },
        },
        assignment: {
          args: { id: { type: new GraphQLNonNull(GraphQLID) } },
          description: 'Finds an assignment for a specific course',
          type: AssignmentType,
          resolve: async (course, args, { logger }) => {
            const { dbId: assignmentId } = fromGlobalId(args.id);

            logger.info('Finding assignment', { assignmentId });

            const assignment = await findAssignment({ assignmentId });

            return assignment;
          },
        },
      };
    },
  }
);

export const courseMutations = {
  setOrganization: {
    name: 'SetCourseOrganization',
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
    resolve: async (_: unknown, args: any, context: Context) => {
      const token = getToken(context);
      if (!token) throw new Error('Token required');

      const { organizationName, courseId: encodedCourseId } = args;

      const { dbId: courseId } = fromGlobalId(encodedCourseId);

      const availableOrganizations = await getGithubUserOrganizationNames(token);

      if (!availableOrganizations.includes(organizationName)) {
        throw new Error(
          `Organization ${organizationName} does not belong to current user`
        );
      }

      context.logger.info(
        `Setting organization ${organizationName} for course ${courseId}`
      );

      const courseFields = {
        ...(await findCourse({ courseId })),
        organization: organizationName,
      };

      return await updateCourse(courseId, courseFields);
    },
  },
};
