import {
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLObjectType,
  GraphQLNonNull,
} from 'graphql';

import { SubjectType } from '../subject/internalGraphql';
import { RoleType } from '../role/internalGraphql';
import { UserType } from '../user/internalGraphql';
import { buildUserRoleType } from '../userRole/internalGraphql';

import { findSubject } from '../subject/subjectService';
import { findAllUserRoles } from '../userRole/userRoleService';

import { toGlobalId } from '../../graphql/utils';

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
