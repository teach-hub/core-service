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
    },
  }),
  mutation: new GraphQLObjectType<null, Context>({
    name: 'Mutation',
    description: 'Admin schema root mutation',
    fields: {
      ...subjectMutations,
      ...courseMutations,
      ...adminUserMutations,
      ...userMutations,
      ...roleMutations,
      ...userRoleMutations,
      ...adminAssignmentMutations,
    },
  }),
});

export default schema;
