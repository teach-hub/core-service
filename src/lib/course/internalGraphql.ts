import {
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLObjectType,
  GraphQLNonNull,
} from 'graphql';

import { RoleType } from '../role/internalGraphql';
import { SubjectType } from '../subject/internalGraphql';

import { findSubject } from '../subject/subjectService';
import { findRole } from '../role/roleService';
import { findAllUserRoles } from '../userRole/userRoleService';

import { toGlobalId } from '../../graphql/utils';

import type { Context } from 'src/types';
import type { CourseFields } from './courseService';

export const CourseType: GraphQLObjectType<CourseFields, Context> = new GraphQLObjectType(
  {
    name: 'CourseType',
    description: 'Courses viewer belongs belongs to',
    fields: () => {
      const UserRoleType = require('../userRole/internalGraphql').UserRoleType;

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
      };
    },
  }
);

export const CourseSummaryType: GraphQLObjectType<CourseFields, Context> =
  new GraphQLObjectType({
    name: 'CourseSummaryType',
    description: 'Summary of courses viewer belongs belongs to',
    fields: {
      id: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: course => {
          return toGlobalId({
            entityName: 'courseSummaryType',
            dbId: String(course.id) as string,
          });
        },
      },
      name: { type: new GraphQLNonNull(GraphQLString) },
      period: { type: new GraphQLNonNull(GraphQLInt) },
      year: { type: new GraphQLNonNull(GraphQLInt) },
      role: {
        type: new GraphQLNonNull(RoleType),
        description: 'Role the user has within a course',
        resolve: async (userCourse, _) => {
          const { roleId } = userCourse;

          const role = await findRole({ roleId });
          return role;
        },
      },
      subject: {
        type: new GraphQLNonNull(SubjectType),
        description: 'Subject the course belongs to',
        resolve: async ({ subjectId }) => {
          const subject = await findSubject({ subjectId: String(subjectId) });
          return subject;
        },
      },
    },
  });
