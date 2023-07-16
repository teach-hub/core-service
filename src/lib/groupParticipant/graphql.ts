import { GraphQLBoolean, GraphQLID, GraphQLObjectType } from 'graphql';

import {
  countGroupParticipants,
  createGroupParticipant,
  findAllGroupParticipants,
  findGroupParticipant,
  type GroupParticipantFields,
  updateGroupParticipant,
} from './service';

import { buildEntityFields } from '../../graphql/fields';
import { buildEntityMutations } from '../../graphql/mutations';

export const getGroupParticipantFields = ({ addId }: { addId: boolean }) => ({
  ...(addId
    ? {
        id: {
          type: GraphQLID,
        },
      }
    : {}),
  assignmentId: {
    type: GraphQLID,
  },
  userRoleId: {
    type: GraphQLID,
  },
  groupId: {
    type: GraphQLID,
  },
  active: {
    type: GraphQLBoolean,
  },
});

export const GroupParticipantType = new GraphQLObjectType({
  name: 'GroupParticipantType',
  description: 'A group participant within TeachHub',
  fields: {
    ...getGroupParticipantFields({ addId: true }),
  },
});

const findGroupParticipantCallback = (id: string): Promise<GroupParticipantFields> =>
  findGroupParticipant({ groupParticipantId: id });

const adminGroupParticipantsFields = buildEntityFields<GroupParticipantFields>({
  type: GroupParticipantType,
  keyName: 'GroupParticipant',
  findCallback: findGroupParticipantCallback,
  findAllCallback: findAllGroupParticipants,
  countCallback: countGroupParticipants,
});

const adminGroupParticipantMutations = buildEntityMutations<GroupParticipantFields>({
  entityName: 'GroupParticipant',
  entityGraphQLType: GroupParticipantType,
  createOptions: {
    args: getGroupParticipantFields({ addId: false }),
    callback: createGroupParticipant,
  },
  updateOptions: {
    args: getGroupParticipantFields({ addId: true }),
    callback: updateGroupParticipant,
  },
  deleteOptions: {
    findCallback: findGroupParticipantCallback,
  },
});

export { adminGroupParticipantMutations, adminGroupParticipantsFields };
