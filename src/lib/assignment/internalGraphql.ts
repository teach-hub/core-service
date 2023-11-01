import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  type AssignmentFields,
  countAssignments,
  createAssignment,
  findAllAssignments,
  findAssignment,
  updateAssignment,
} from './assignmentService';

import { buildEntityFields } from '../../graphql/fields';
import { buildEntityMutations } from '../../graphql/mutations';

export const getAssignmentFields = ({ addId }: { addId: boolean }) => ({
  ...(addId
    ? {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      }
    : {}),
  courseId: {
    type: new GraphQLNonNull(GraphQLID),
  },
  title: {
    type: new GraphQLNonNull(GraphQLString),
  },
  description: {
    type: GraphQLString,
  },
  startDate: {
    type: GraphQLString,
  },
  endDate: {
    type: GraphQLString,
  },
  link: {
    type: GraphQLString,
  },
  allowLateSubmissions: {
    type: GraphQLBoolean,
  },
  active: {
    type: GraphQLBoolean,
  },
  isGroup: {
    type: GraphQLBoolean,
  },
});

export const InternalAssignmentType = new GraphQLObjectType({
  name: 'InternalAssignmentType',
  description: 'An assignment within TeachHub',
  fields: getAssignmentFields({ addId: true }),
});

const findAssignmentCallback = (id: number): Promise<AssignmentFields | null> =>
  findAssignment({ assignmentId: id });

const adminAssignmentsFields = buildEntityFields<AssignmentFields>({
  type: InternalAssignmentType,
  keyName: 'Assignment',
  findCallback: findAssignmentCallback,
  findAllCallback: findAllAssignments,
  countCallback: countAssignments,
});

const adminAssignmentMutations = buildEntityMutations<AssignmentFields>({
  entityName: 'Assignment',
  entityGraphQLType: InternalAssignmentType,
  createOptions: {
    args: getAssignmentFields({ addId: false }),
    callback: createAssignment,
  },
  updateOptions: {
    args: getAssignmentFields({ addId: true }),
    callback: updateAssignment,
  },
  deleteOptions: {
    findCallback: findAssignmentCallback,
  },
});

export { adminAssignmentMutations, adminAssignmentsFields };
