import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { chunk, flatten, keyBy } from 'lodash';
import { getAssignmentFields } from './internalGraphql';
import {
  AssignmentFields,
  createAssignment,
  updateAssignment,
} from './assignmentService';
import { fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';

import { ReviewerPreviewType, ReviewerType } from '../reviewer/internalGraphql';
import { SubmissionType } from '../submission/internalGraphql';
import { findAllSubmissions, findSubmission } from '../submission/submissionsService';
import { findReviewers } from '../reviewer/service';
import { findAllUserRoles } from '../userRole/userRoleService';
import { findAllRoles } from '../role/roleService';

import type { Context } from '../../types';

const previewReviewersFilter = {
  input: {
    type: new GraphQLInputObjectType({
      name: 'PreviewReviewersFilterInputType',
      fields: {
        consecutive: {
          type: new GraphQLNonNull(GraphQLBoolean),
        },
        teachersUserIds: {
          type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
        },
      },
    }),
  },
};

export const AssignmentType = new GraphQLObjectType({
  name: 'AssignmentType',
  fields: {
    ...getAssignmentFields({ addId: false }),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'assignment',
          dbId: String(s.id),
        }),
    },
    courseId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'assignment',
          dbId: String(s.courseId),
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
    reviewers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReviewerType))),
      resolve: async (assignment, _, ctx: Context) => {
        try {
          const reviewers = await findReviewers({ assignmentId: assignment.id });

          ctx.logger.info('Returning reviewers', { reviewers });

          return reviewers;
        } catch (error) {
          ctx.logger.error('An error happened while returning reviewers', { error });
          return [];
        }
      },
    },
    previewReviewers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReviewerPreviewType))),
      args: previewReviewersFilter,
      resolve: async (assignment, args, ctx: Context) => {
        try {
          const { consecutive, teachersUserIds: encodedTeacherUserIds } = args.input;
          const teachersUserIds: number[] =
            encodedTeacherUserIds.map(fromGlobalIdAsNumber);

          const alreadySetRevieweesIds = await findReviewers({
            assignmentId: assignment.id,
          }).then(reviewers => reviewers.map(r => r.revieweeUserId));

          // Mover esto a una function: Buscar profesores y alumnos
          // es bastante comun para cualquier flujo.

          const courseUserRoles = await findAllUserRoles({
            forCourseId: assignment.courseId,
          });

          // Filtramos a los que ya tienen seteado el reviewer.
          const pendingUserRoles = courseUserRoles.filter(
            x => !alreadySetRevieweesIds.includes(x.userId)
          );

          const allRoles = await findAllRoles({});

          const allRolesById = keyBy(allRoles, 'id');

          const studentsUserRoles = pendingUserRoles.filter(
            userRole => !allRolesById[userRole.roleId!].isTeacher
          );

          const teachersUserRoles = courseUserRoles.filter(userRole => {
            const roleIsTeacher = allRolesById[userRole.roleId!].isTeacher;

            if (!teachersUserIds.length) {
              ctx.logger.info('No teachers matched the filters, using all as default');
              return roleIsTeacher;
            }

            return roleIsTeacher && teachersUserIds.includes(userRole.userId!);
          });

          ctx.logger.info('Returning reviewers preview', {
            studentsUserRoles,
            teachersUserRoles,
            args: { args: args.input },
          });

          // Consecutive
          if (consecutive) {
            const result = chunk(
              studentsUserRoles,
              Math.ceil(studentsUserRoles.length / teachersUserRoles.length)
            ).map((chunk, i) => {
              return chunk.map(user => ({
                id: `${assignment.id}-${user.userId}-${teachersUserRoles[i].userId}`,
                reviewerUserId: teachersUserRoles[i].userId,
                assignmentId: assignment.id,
                revieweeUserId: user.userId,
              }));
            });

            return flatten(result);
          }

          // Alternate
          return studentsUserRoles.map((user, i) => {
            const reviewerUserId = teachersUserRoles[i % teachersUserRoles.length].userId;

            return {
              id: `${assignment.id}-${user.userId}-${reviewerUserId}`,
              reviewerUserId,
              assignmentId: assignment.id,
              revieweeUserId: user.userId,
            };
          });
        } catch (error) {
          ctx.logger.error('Error', error);
          return [];
        }
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
    isGroup,
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
    isGroup,
    allowLateSubmissions,
    description,
    courseId: fixedCourseId,
    id: fixedId,
  };
};
