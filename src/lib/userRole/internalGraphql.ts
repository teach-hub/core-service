import { GraphQLObjectType, GraphQLString, GraphQLBoolean } from 'graphql';

import { findRole } from '../role/roleService';
import { findCourse } from '../course/courseService';
import { findUser } from '../user/userService';

import { UserType } from '../user/internalGraphql';
import { RoleType } from '../role/internalGraphql';
import { CourseType } from '../course/internalGraphql';

import { toGlobalId } from '../../graphql/utils';

export const UserRoleType = new GraphQLObjectType({
  name: 'UserRoleType',
  description: '',
  fields: {
    id: {
      type: GraphQLString,
      resolve: s =>
        toGlobalId({
          entityName: 'userRole',
          dbId: String(s.id) as string,
        }),
    },
    active: { type: GraphQLBoolean },
    user: {
      type: UserType,
      resolve: userRole => {
        return findUser({ userId: String(userRole.userId) });
      },
    },
    role: {
      type: RoleType,
      resolve: userRole => {
        return findRole({ roleId: String(userRole.roleId) });
      },
    },
    course: {
      type: CourseType,
      resolve: userRole => {
        return findCourse({ courseId: String(userRole.courseId) });
      },
    },
  },
});
