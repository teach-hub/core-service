import {
  GraphQLID,
  GraphQLOutputType,
  GraphQLObjectType,
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
            type: new GraphQLNonNull(GraphQLID),
            resolve: s =>
              toGlobalId({
                entityName: 'userRole',
                dbId: s.id,
              }),
          },
          active: { type: new GraphQLNonNull(GraphQLBoolean) },
          user: {
            type: new GraphQLNonNull(userType),
            resolve: userRole => findUser({ userId: userRole.userId }),
          },
          role: {
            type: new GraphQLNonNull(roleType),
            resolve: async (userRole, _, context) => {
              try {
                context.logger.info('Finding role for userRole', userRole);
                return await findRole({ roleId: userRole.roleId });
              } catch (e) {
                context.logger.error(e);
                throw e;
              }
            },
          },
          course: {
            type: new GraphQLNonNull(courseType),
            resolve: async (userRole, _, context) => {
              try {
                const result = await findCourse({ courseId: userRole.courseId });
                return result;
              } catch (e) {
                context.logger.error(e);
                throw e;
              }
            },
          },
        },
      });

  return _instance;
};
