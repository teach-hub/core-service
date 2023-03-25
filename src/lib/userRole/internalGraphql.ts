import {
  GraphQLOutputType,
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLNonNull,
} from 'graphql';

import { findRole } from '../role/roleService';
import { findCourse } from '../course/courseService';
import { findUser } from '../user/userService';

import { toGlobalId } from '../../graphql/utils';

let _instance: GraphQLOutputType | null = null;

export const buildUserRoleType = ({
  roleType,
  userType,
  courseType,
}: {
  roleType: GraphQLOutputType;
  userType: GraphQLOutputType;
  courseType: GraphQLOutputType;
}) => {
  _instance = _instance
    ? _instance
    : new GraphQLObjectType({
        name: 'UserRoleType',
        fields: {
          id: {
            type: GraphQLString,
            resolve: s =>
              toGlobalId({
                entityName: 'userRole',
                dbId: String(s.id) as string,
              }),
          },
          active: { type: new GraphQLNonNull(GraphQLBoolean) },
          user: {
            type: userType,
            resolve: userRole => findUser({ userId: String(userRole.userId) }),
          },
          role: {
            type: roleType,
            resolve: userRole => findRole({ roleId: String(userRole.roleId) }),
          },
          course: {
            type: courseType,
            resolve: userRole => findCourse({ courseId: String(userRole.courseId) }),
          },
        },
      });

  return _instance;
};
