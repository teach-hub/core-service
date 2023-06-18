import {
  GraphQLID,
  GraphQLFieldConfigMap,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLList,
} from 'graphql';
import { getAssignmentFields } from './internalGraphql';
import {
  AssignmentFields,
  createAssignment,
  updateAssignment,
} from './assignmentService';
import { fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';

import { SubmissionType } from '../submission/internalGraphql';
import { findSubmission, findAllSubmissions } from '../submission/submissionsService';

import type { Context } from '../../types';

export const AssignmentType = new GraphQLObjectType({
  name: 'AssignmentType',
  fields: {
    ...getAssignmentFields({ addId: false }),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'assignment',
          dbId: String(s.id) as string,
        }),
    },
    courseId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'assignment',
          dbId: String(s.courseId) as string,
        }),
    },
    submission: {
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      type: SubmissionType,
      resolve: async (_, { id }, ctx) => {
        const submissionId = fromGlobalIdAsNumber(id);
        const submission = await findSubmission({ submissionId });

        ctx.logger.info('Requested submission with id', { submission });

        return submission;
      },
    },
    submissions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SubmissionType))),
      resolve: async (assignment, _, ctx: Context) => {
        const submissions = await findAllSubmissions({ forAssignmentId: assignment.id });

        ctx.logger.info('Returning submissions', { submissions });

        return submissions;
      },
    },
  },
});

export const assignmentMutations: GraphQLFieldConfigMap<unknown, Context> = {
  createAssignment: {
    description: 'Creates an assignment in a course',
    type: AssignmentType,
    args: getAssignmentFields({ addId: false }),
    resolve: async (_, args, ctx) => {
      const assignmentData: AssignmentFields = parseAssignmentData(args);

      ctx.logger.info('Creating assignment with data', assignmentData);

      return await createAssignment(assignmentData);
    },
  },
  updateAssignment: {
    description: 'Updates an assignment in a course',
    type: AssignmentType,
    args: getAssignmentFields({ addId: true }),
    resolve: async (_, args, ctx) => {
      const assignmentData: AssignmentFields = parseAssignmentData(args);
      ctx.logger.info(`Updating assignment with data: ` + JSON.stringify(assignmentData));

      const { id } = args;
      const fixedId = fromGlobalIdAsNumber(id);

      return await updateAssignment(String(fixedId), assignmentData);
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseAssignmentData = (args: any): AssignmentFields => {
  const {
    courseId,
    title,
    startDate,
    endDate,
    link,
    allowLateSubmissions,
    id,
    active,
    description,
  } = args;

  const fixedId = id ? fromGlobalIdAsNumber(id) : undefined;
  const fixedCourseId = fromGlobalIdAsNumber(courseId);

  return {
    title,
    startDate,
    endDate,
    link,
    active,
    allowLateSubmissions,
    description,
    courseId: fixedCourseId,
    id: fixedId,
  };
};
