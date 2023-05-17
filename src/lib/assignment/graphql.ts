import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { getAssignmentFields } from './internalGraphql';
import { Context } from '../../types';
import {
  AssignmentFields,
  createAssignment,
  updateAssignment,
} from './assignmentService';
import { fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';

export const AssignmentType = new GraphQLObjectType({
  name: 'AssignmentType',
  fields: {
    ...getAssignmentFields({ addId: false }),
    id: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: s =>
        toGlobalId({
          entityName: 'assignment',
          dbId: String(s.id) as string,
        }),
    },
    courseId: {
      type: GraphQLString,
      resolve: s =>
        toGlobalId({
          entityName: 'assignment',
          dbId: String(s.courseId) as string,
        }),
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

      ctx.logger.info(`Creating assignment with data: ` + JSON.stringify(assignmentData));

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
