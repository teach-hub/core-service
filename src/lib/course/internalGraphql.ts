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
import { UserType } from '../user/internalGraphql';

import { findSubject } from '../subject/subjectService';
import { findRole } from '../role/roleService';
import { findUsersInCourse } from '../user/userService';

import type { Context } from 'src/types';
import type { CourseFields } from './courseService';

import { toGlobalId, fromGlobalId } from '../../graphql/utils';

export const CourseType: GraphQLObjectType<CourseFields, Context> = new GraphQLObjectType(
  {
    name: 'CourseType',
    description: 'Courses viewer belongs belongs to',
    fields: {
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
      role: {
        type: new GraphQLNonNull(RoleType),
        description: 'Role the user has within a course',
        resolve: async (userCourse, _, ctx) => {
          const { roleId } = userCourse;

          ctx.logger.info('Finding role with id', { roleId });

          return findRole({ roleId });
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
      users: {
        type: new GraphQLNonNull(new GraphQLList(UserType)),
        description: 'Users in course',
        resolve: async (course, _, ctx) => {
          const { logger } = ctx;

          logger.info(`Looking for users within course ${course.id}`);

          const users = course.id
            ? await findUsersInCourse({ courseId: course.id })
            : null;
          return users;
        },
      },
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
