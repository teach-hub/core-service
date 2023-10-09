import { GraphQLID, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { toGlobalId } from '../../graphql/utils';

import { getGroupParticipantFields } from './graphql';
import { findGroup } from '../group/service';
import { UserType } from '../user/internalGraphql';
import { findUserRole } from '../userRole/userRoleService';
import { InternalGroupType } from '../group/internalGraphql';
import { findUser } from '../user/userService';

export const InternalGroupParticipantType = new GraphQLObjectType({
  name: 'InternalGroupParticipantType',
  description: 'A group participant within TeachHub',
  fields: {
    ...getGroupParticipantFields({ addId: true }),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'groupParticipant',
          dbId: s.id,
        }),
    },
    userRoleId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'userRole',
          dbId: s.userRoleId,
        }),
    },
    user: {
      type: new GraphQLNonNull(UserType),
      resolve: async participant => {
        const participantUserRole = await findUserRole({ id: participant.userRoleId });

        if (!participantUserRole) {
          throw new Error('User role not found');
        }

        return findUser({ userId: participantUserRole.userId });
      },
    },
    group: {
      type: new GraphQLNonNull(InternalGroupType),
      resolve: async groupParticipant => {
        return findGroup({ groupId: groupParticipant.groupId });
      },
    },
    groupId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'group',
          dbId: s.groupId,
        }),
    },
  },
});
