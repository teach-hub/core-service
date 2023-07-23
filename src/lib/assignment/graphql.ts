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
import { uniq, chunk, flatten, keyBy } from 'lodash';

import { getAssignmentFields } from './internalGraphql';

import {
  AssignmentFields,
  createAssignment,
  updateAssignment,
  findAssignment,
} from './assignmentService';
import { fromGlobalId, fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';

import { findAllSubmissions, findSubmission } from '../submission/submissionsService';
import { ReviewerFields, createReviewers, findReviewers } from '../reviewer/service';
import { UserRoleFields, findAllUserRoles } from '../userRole/userRoleService';
import { findAllRoles } from '../role/roleService';
import { GroupFields, findAllGroups } from '../group/service';
import { findAllGroupParticipants } from '../groupParticipant/service';

import {
  AssignReviewersInputType,
  ReviewerPreviewType,
  ReviewerType,
} from '../reviewer/internalGraphql';
import { getViewer } from '../user/internalGraphql';
import { SubmissionType } from '../submission/internalGraphql';
import { InternalGroupParticipantType } from '../groupParticipant/internalGraphql';

import type { Context } from '../../types';

const PreviewReviewersFilterType = {
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
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
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
    groupParticipants: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(InternalGroupParticipantType))
      ),
      resolve: async assignment => {
        const participants = await findAllGroupParticipants({
          forAssignmentId: assignment.id,
        });
        return participants;
      },
    },
    reviewers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReviewerType))),
      resolve: async (assignment, _, ctx: Context) => {
        try {
          const reviewers = await findReviewers({ assignmentId: assignment.id });

          ctx.logger.info('Returning reviewers for assignment', {
            assignment,
            reviewers,
          });

          return reviewers.map(reviewer => {
            return {
              id: reviewer.id,
              assignmentId: reviewer.assignmentId,
              reviewerUserId: reviewer.reviewerUserId,
              revieweeId: reviewer.revieweeId,
              isGroup: assignment.isGroup,
            };
          });
        } catch (error) {
          ctx.logger.error('An error happened while returning reviewers', { error });
          return [];
        }
      },
    },
    previewReviewers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReviewerPreviewType))),
      args: PreviewReviewersFilterType,
      resolve: async (assignment, args, ctx: Context) => {
        try {
          const { consecutive, teachersUserIds: encodedTeacherUserIds } = args.input;
          const teachersUserIds: number[] =
            encodedTeacherUserIds.map(fromGlobalIdAsNumber);

          const alreadySetReviewers = await findReviewers({
            assignmentId: assignment.id,
          });

          // Mover esto a una function: Buscar profesores y alumnos
          // es bastante comun para cualquier flujo.

          const courseUserRoles = await findAllUserRoles({
            forCourseId: assignment.courseId,
          });

          const allRolesById = await findAllRoles({}).then(allRoles =>
            keyBy(allRoles, 'id')
          );

          let revieweeIds: GroupFields['id'][] | UserRoleFields['userId'][] = [];

          if (assignment.isGroup) {
            // -- Manejo de grupos. --
            const [allGroups, uniqParticipantGroupIds] = await Promise.all([
              findAllGroups({ forCourseId: assignment.courseId }),
              findAllGroupParticipants({ forAssignmentId: assignment.id }).then(
                allParticipants => {
                  return uniq(allParticipants.map(p => p.groupId));
                }
              ),
            ]);

            const alreadySetGroupIds = alreadySetReviewers.map(x => x.revieweeId);

            // Filtramos a los que ya tienen seteado el reviewer.
            revieweeIds = allGroups
              .map(group => group.id)
              .filter(
                groupId =>
                  uniqParticipantGroupIds.includes(groupId) &&
                  !alreadySetGroupIds.includes(groupId)
              );

            console.log('Groups reviewees', revieweeIds);
          } else {
            // Filtramos a los que ya tienen seteado el reviewer.
            const pendingUserRoles = courseUserRoles.filter(
              x => !alreadySetReviewers.map(x => x.revieweeId).includes(x.userId)
            );

            revieweeIds = pendingUserRoles
              .filter(userRole => !allRolesById[userRole.roleId!].isTeacher)
              .map(student => student.userId);
          }

          const teachersUserRoles = courseUserRoles.filter(userRole => {
            const roleIsTeacher = allRolesById[userRole.roleId!].isTeacher;

            if (!teachersUserIds.length) {
              ctx.logger.info('No teachers matched the filters, using all as default');
              return roleIsTeacher;
            }

            return roleIsTeacher && teachersUserIds.includes(userRole.userId!);
          });

          ctx.logger.info('Returning reviewers preview', {
            studentsUserRoles: revieweeIds,
            teachersUserRoles,
            args: { args: args.input },
          });

          // Consecutive
          if (consecutive) {
            const chunksAmount = Math.ceil(revieweeIds.length / teachersUserRoles.length);

            const result = chunk(revieweeIds, chunksAmount).map((chunk, i) => {
              const reviewerUserId = teachersUserRoles[i].userId;

              return chunk.map(revieweeId => ({
                id: `${assignment.id}-${revieweeId}-${reviewerUserId}`,
                reviewerUserId,
                revieweeId,
                assignmentId: assignment.id,
                isGroup: assignment.isGroup,
              }));
            });

            return flatten(result);
          }

          // Alternate
          return revieweeIds.map((revieweeId, i) => {
            const reviewerUserId = teachersUserRoles[i % teachersUserRoles.length].userId;

            return {
              id: `${assignment.id}-${revieweeId}-${reviewerUserId}`,
              reviewerUserId,
              revieweeId,
              assignmentId: assignment.id,
              isGroup: assignment.isGroup,
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

export const assignmentMutations: GraphQLFieldConfigMap<null, Context> = {
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
  // Esto vive aca porque si bien el manejo es de reviewers
  // meterlo en reviewers genera un dependencia circular.
  assignReviewers: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReviewerType))),
    args: AssignReviewersInputType,
    resolve: async (_, args, context) => {
      try {
        const {
          input: { assignmentId: encodedAssignmentId, reviewers },
        } = args;

        const viewer = getViewer(context);

        if (!viewer) {
          throw new Error('Viewer not found!');
        }

        const assignmentId = fromGlobalId(encodedAssignmentId).dbId;
        const assignment = await findAssignment({ assignmentId });

        if (!assignment) {
          throw new Error('Assignment not found');
        }

        context.logger.info('Assigning reviewers for assignment', { id: assignmentId });

        const reviewerFields: ReviewerFields[] = reviewers.map(
          (reviewer: { reviewerUserId: string; revieweeId: string }) => {
            return {
              reviewerUserId: fromGlobalIdAsNumber(reviewer.reviewerUserId),
              revieweeId: fromGlobalIdAsNumber(reviewer.revieweeId),
              assignmentId: assignment.id,
            };
          }
        );

        context.logger.info('Assigning reviewers in assignment', {
          assignmentId: assignment.id,
          reviewerFields,
        });

        return createReviewers(reviewerFields).then(reviewers =>
          reviewers.map(reviewer => {
            return {
              id: reviewer.id,
              assignmentId: reviewer.assignmentId,
              reviewerUserId: reviewer.reviewerUserId,
              revieweeId: reviewer.revieweeId,
              isGroup: assignment.isGroup,
            };
          })
        );
      } catch (e) {
        context.logger.error('Error on assignReviewers mutation', { error: String(e) });
        return [];
      }
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
