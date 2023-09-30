import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { getGroupFields } from './graphql';
import { toGlobalId } from '../../graphql/utils';
import { findAllGroupParticipants } from '../groupParticipant/service';

import { UserType } from '../user/internalGraphql';
import { findAllUsers } from '../user/userService';
import { findAllUserRoles } from '../userRole/userRoleService';
import { Context } from '../../types';
import { GroupFields } from './service';

export const InternalGroupType: GraphQLObjectType = new GraphQLObjectType<
  GroupFields & { assignmentId: number },
  Context
>({
  name: 'InternalGroupType',
  description: 'A group within TeachHub',
  fields: () => ({
    ...getGroupFields({ addId: false }),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'group',
          dbId: s.id!,
        }),
    },
    courseId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'course',
          dbId: s.courseId!,
        }),
    },
    assignmentId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'assignment',
          dbId: s.assignmentId!,
        }),
    },
    members: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      description: 'Who are the members of this group?',
      resolve: async (group, _, __) => {
        const groupParticipants = await findAllGroupParticipants({
          forGroupId: group.id,
        });

        // Find user roles for every participant, and then the users for each of them
        const userRoles = await findAllUserRoles({
          id: groupParticipants
            .map(groupParticipant => groupParticipant.userRoleId)
            .filter(id => id) as number[],
        });

        return await findAllUsers({
          id: userRoles.map(userRole => userRole.userId).filter(id => id) as number[],
        });
      },
    },
  }),
});
