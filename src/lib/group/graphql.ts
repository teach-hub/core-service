import { GraphQLBoolean, GraphQLID, GraphQLObjectType, GraphQLString } from 'graphql';

import {
  countGroups,
  createGroup,
  findAllGroups,
  findGroup,
  type GroupFields,
  updateGroup,
} from './service';

import { buildEntityFields } from '../../graphql/fields';
import { buildEntityMutations } from '../../graphql/mutations';

export const getGroupFields = ({ addId }: { addId: boolean }) => ({
  ...(addId
    ? {
        id: {
          type: GraphQLID,
        },
      }
    : {}),
  courseId: {
    type: GraphQLID,
  },
  name: {
    type: GraphQLString,
  },
  active: {
    type: GraphQLBoolean,
  },
});

export const GroupType = new GraphQLObjectType({
  name: 'GroupType',
  description: 'A group within TeachHub',
  fields: getGroupFields({ addId: true }),
});

const findGroupCallback = (id: number): Promise<GroupFields> =>
  findGroup({ groupId: id });

const adminGroupsFields = buildEntityFields<GroupFields>({
  type: GroupType,
  keyName: 'Group',
  findCallback: findGroupCallback,
  findAllCallback: findAllGroups,
  countCallback: countGroups,
});

const adminGroupMutations = buildEntityMutations<GroupFields>({
  entityName: 'Group',
  entityGraphQLType: GroupType,
  createOptions: {
    args: getGroupFields({ addId: false }),
    callback: createGroup,
  },
  updateOptions: {
    args: getGroupFields({ addId: true }),
    callback: updateGroup,
  },
  deleteOptions: {
    findCallback: findGroupCallback,
  },
});

export { adminGroupMutations, adminGroupsFields };
