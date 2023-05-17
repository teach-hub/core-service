import {
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

import { findSubject } from '../subject/subjectService';
import { findAllAssignments, findAssignment } from '../assignment/assignmentService';
import { findAllUserRoles } from '../userRole/userRoleService';
import { findAllRoles } from '../role/roleService';

import { fromGlobalId, toGlobalId } from '../../graphql/utils';

import type { Context } from 'src/types';
import type { CourseFields } from './courseService';

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
          type: new GraphQLNonNull(GraphQLString),
          resolve: s => {
            return toGlobalId({
              entityName: 'course',
              dbId: String(s.id) as string,
            });
          },
        },
        name: { type: new GraphQLNonNull(GraphQLString) },
        organization: { type: new GraphQLNonNull(GraphQLString) },
        period: { type: new GraphQLNonNull(GraphQLInt) },
        year: { type: new GraphQLNonNull(GraphQLInt) },
        active: { type: new GraphQLNonNull(GraphQLBoolean) },
        teachersCount: {
          type: new GraphQLNonNull(GraphQLInt),
          resolve: async course => {
            const userRoles = await findAllUserRoles({ forCourseId: course.id });
            const allRoles = await findAllRoles({});

            const allRolesById = keyBy(allRoles, 'id');

            const courseRoles = userRoles
              .map(userRole => allRolesById[userRole.roleId!])
              .filter(role => role?.name !== 'Alumno');

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
              .filter(role => role?.name === 'Alumno');

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
          description: 'Assignments within the course',
          resolve: async ({ id: courseId }) => {
            const assignments = courseId
              ? await findAllAssignments({ forCourseId: courseId })
              : [];

            return assignments;
          },
        },
        findAssignment: {
          args: { id: { type: new GraphQLNonNull(GraphQLString) } },
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
