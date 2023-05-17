import { buildEntityFields } from '../../graphql/fields';

import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  countAssignments,
  createAssignment,
  findAllAssignments,
  findAssignment,
  updateAssignment,
} from './assignmentService';

import { buildEntityMutations } from '../../graphql/mutations';

export const getAssignmentFields = ({ addId }: { addId: boolean }) => ({
  ...(addId ? { id: { type: GraphQLID } } : {}),
  courseId: { type: GraphQLString },
  title: { type: GraphQLString },
  description: { type: GraphQLString },
  startDate: { type: GraphQLString },
  endDate: { type: GraphQLString },
  link: { type: GraphQLString },
  allowLateSubmissions: { type: GraphQLBoolean },
  active: { type: GraphQLBoolean },
});

export const InternalAssignmentType = new GraphQLObjectType({
  name: 'AssignmentType',
  description: 'An assignment within TeachHub',
  fields: getAssignmentFields({ addId: true }),
});

const findAssignmentCallback = (id: string) => {
  return findAssignment({ assignmentId: id });
};

const adminAssignmentsFields = buildEntityFields({
  type: InternalAssignmentType,
  keyName: 'Assignment',
  typeName: 'assignment',
  findCallback: findAssignmentCallback,
  findAllCallback: findAllAssignments,
  countCallback: countAssignments,
});

const adminAssignmentMutations = buildEntityMutations({
  type: InternalAssignmentType,
  keyName: 'Assignment',
  typeName: 'assignment',
  createFields: getAssignmentFields({ addId: false }),
  updateFields: getAssignmentFields({ addId: true }),
  createCallback: createAssignment,
  updateCallback: updateAssignment,
  findCallback: findAssignmentCallback,
});

export { adminAssignmentMutations, adminAssignmentsFields };
