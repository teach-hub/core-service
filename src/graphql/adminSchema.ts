import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import { subjectFields, subjectMutations } from '../lib/subject/graphql';
import { courseFields, courseMutations } from '../lib/course/graphql';
import { adminUserFields, adminUserMutations } from '../lib/adminUser/graphql';
import { userFields, userMutations } from '../lib/user/graphql';
import { roleFields, roleMutations } from '../lib/role/graphql';
import { userRoleFields, userRoleMutations } from '../lib/userRole/graphql';

import type { Context } from 'src/types';
import {
  adminAssignmentMutations,
  adminAssignmentsFields,
} from '../lib/assignment/internalGraphql';
import {
  adminRepositoriesFields,
  adminRepositoryMutations,
} from '../lib/repository/graphql';
import { adminGroupMutations, adminGroupsFields } from '../lib/group/graphql';
import {
  adminGroupParticipantMutations,
  adminGroupParticipantsFields,
} from '../lib/groupParticipant/graphql';
import { adminReviewMutations, adminReviewsFields } from '../lib/review/graphql';
import { authMutations } from '../lib/auth/internalGraphql';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType<null, Context>({
    name: 'Query',
    description: 'Admin schema root query',
    fields: {
      ...subjectFields,
      ...courseFields,
      ...adminUserFields,
      ...userFields,
      ...roleFields,
      ...userRoleFields,
      ...adminAssignmentsFields,
      ...adminRepositoriesFields,
      ...adminGroupsFields,
      ...adminGroupParticipantsFields,
      ...adminReviewsFields,
    },
  }),
  mutation: new GraphQLObjectType<null, Context>({
    name: 'Mutation',
    description: 'Admin schema root mutation',
    fields: {
      ...authMutations,
      ...subjectMutations,
      ...courseMutations,
      ...adminUserMutations,
      ...userMutations,
      ...roleMutations,
      ...userRoleMutations,
      ...adminAssignmentMutations,
      ...adminRepositoryMutations,
      ...adminGroupMutations,
      ...adminGroupParticipantMutations,
      ...adminReviewMutations,
    },
  }),
});

export default schema;
