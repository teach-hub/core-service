import type { GraphQLFieldConfigMap } from 'graphql';
import {
  GraphQLInt,
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql';

import { fromGlobalId, fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';
import { isDefinedAndNotEmpty } from '../../utils/object';

import {
  createSubmission,
  updateSubmission,
  findSubmission,
  SubmissionFields,
} from '../submission/submissionsService';
import { findUser } from '../user/userService';
import { findGroup } from '../group/service';
import { getViewer, UserType } from '../user/internalGraphql';

import { dateToString } from '../../utils/dates';
import { ReviewerType } from '../reviewer/internalGraphql';
import { InternalGroupType } from '../group/internalGraphql';
import { findReviewer } from '../reviewer/service';
import {
  findReviewerAndCheckIfIsReviewerForSubmission,
  InternalReviewType,
} from '../review/internalGraphql';
import { createReview, findAllReviews, findReview } from '../review/service';
import { AssignmentType } from '../assignment/graphql';
import { findAssignment } from '../assignment/assignmentService';

import type { AuthenticatedContext } from '../../context';

export const SubmitterUnionType = new GraphQLUnionType({
  name: 'SubmitterUnionType',
  types: [UserType, InternalGroupType],
  resolveType: obj => {
    return 'file' in obj ? UserType : InternalGroupType;
  },
});

export const NonExistentSubmissionType = new GraphQLObjectType<
  { submitterId: number; assignmentId: number; isGroup: boolean },
  AuthenticatedContext
>({
  name: 'NonExistentSubmissionType',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'nonExistentSubmission',
          dbId: `${s.submitterId}-${s.assignmentId}`,
        }),
    },
    reviewer: {
      type: ReviewerType,
      description: 'Reviewer of the submission to be made',
      resolve: async nonExistentSubmission => {
        const reviewer = await findReviewer({
          revieweeId: nonExistentSubmission.submitterId,
          assignmentId: nonExistentSubmission.assignmentId,
        });

        /* Reviewer may or may not be assigned yet */
        if (isDefinedAndNotEmpty(reviewer)) {
          return reviewer;
        }
        return null;
      },
    },
    submitter: {
      type: new GraphQLNonNull(SubmitterUnionType),
      description: 'User or group who has not made the submission',
      resolve: async (nonExistentSubmission, _, __) => {
        if (nonExistentSubmission.isGroup) {
          return findGroup({ groupId: String(nonExistentSubmission.submitterId) });
        }

        return findUser({ userId: String(nonExistentSubmission.submitterId) });
      },
    },
  }),
});

export const SubmissionType: GraphQLObjectType = new GraphQLObjectType<
  SubmissionFields & { isGroup: boolean },
  AuthenticatedContext
>({
  name: 'SubmissionType',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'submission',
          dbId: String(s.id),
        }),
    },
    description: {
      type: GraphQLString,
    },
    assignmentId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'assignment',
          dbId: String(s.assignmentId),
        }),
    },
    submitter: {
      type: new GraphQLNonNull(SubmitterUnionType),
      description: 'User or group who has made the submission',
      resolve: async (submission, _, ctx) => {
        const assignment = await findAssignment({
          assignmentId: String(submission.assignmentId),
        });

        if (!assignment) {
          throw new Error('Assignment not found.');
        }

        if (assignment.isGroup) {
          ctx.logger.info('Looking for grupal submission', {
            submitterId: submission.submitterId,
          });
          const group = await findGroup({ groupId: String(submission.submitterId) });
          if (!isDefinedAndNotEmpty(group)) {
            return group;
          }
          return { ...group, assignmentId: assignment.id };
        }

        return findUser({ userId: String(submission.submitterId) });
      },
    },
    reviewer: {
      type: ReviewerType,
      resolve: async (submission, _, ctx: AuthenticatedContext) => {
        try {
          const reviewer = await findSubmissionReviewer(submission);

          // TODO. Dejar de tener campos nulleables en los DTO.
          // `ReviewerFields` tiene campos que son todos null cuando no lo encuentra.
          if (!isDefinedAndNotEmpty(reviewer)) {
            return null;
          }

          ctx.logger.info('Returning reviewer', { reviewer });

          return reviewer;
        } catch (error) {
          ctx.logger.error('An error happened while returning reviewer', { error });
          return [];
        }
      },
    },
    pullRequestUrl: {
      type: new GraphQLNonNull(GraphQLString),
    },
    submittedAt: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Date when submission was created',
      resolve: s => s.submittedAt && dateToString(s.submittedAt),
    },
    submittedAgainAt: {
      type: GraphQLString,
      description: 'Date when submission was submitted again',
      resolve: s => s.submittedAgainAt && dateToString(s.submittedAgainAt),
    },
    review: {
      type: InternalReviewType,
      resolve: async (submission, _, ctx: AuthenticatedContext) => {
        try {
          const review = await findReview({
            submissionId: submission.id,
          });

          ctx.logger.info('Returning review', { review });

          // TODO. Dejar de tener campos nulleables en los DTO.
          // `ReviewFields` tiene campos que son todos null cuando no lo encuentra.
          if (!isDefinedAndNotEmpty(review)) {
            return null;
          }

          return review;
        } catch (error) {
          ctx.logger.error('An error happened while returning review', { error });
          return null;
        }
      },
    },
    assignment: {
      description: 'Finds an assignment from a submission',
      type: AssignmentType,
      resolve: async (submission, _, { logger }) => {
        const assignment = await findAssignment({
          assignmentId: String(submission.assignmentId),
        });

        logger.info('Finding assignment from sub', { assignment });
        return assignment;
      },
    },
    viewerCanReview: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: async (submission, _, ctx: AuthenticatedContext) => {
        try {
          const viewer = await getViewer(ctx);

          if (!viewer) {
            return false;
          }

          const reviewer = await findSubmissionReviewer(submission);

          /* Viewer id must match reviewer user id to enable review */
          return Boolean(reviewer?.reviewerUserId === viewer.id);
        } catch (error) {
          ctx.logger.error('An error happened while returning reviewEnabledForViewer', {
            error,
          });
          return false;
        }
      },
    },
  }),
});

const findSubmissionReviewer = async (submission: SubmissionFields) => {
  return await findReviewer({
    revieweeId: submission.submitterId,
    assignmentId: submission.assignmentId,
  });
};

export const submissionMutations: GraphQLFieldConfigMap<null, AuthenticatedContext> = {
  createSubmission: {
    description: 'Creates a new submission for the viewer',
    type: new GraphQLNonNull(SubmissionType),
    args: {
      assignmentId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      pullRequestUrl: {
        type: new GraphQLNonNull(GraphQLString),
      },
      description: {
        type: GraphQLString,
      },
    },
    resolve: async (_, args, ctx) => {
      try {
        const viewer = await getViewer(ctx);

        const { assignmentId: encodedAssignmentId, description, pullRequestUrl } = args;
        const { dbId: assignmentId } = fromGlobalId(encodedAssignmentId);

        if (!viewer || !viewer.id) {
          throw new Error('Viewer not found');
        }

        ctx.logger.info('Creating submission for assignment', {
          assignmentId,
          userId: viewer.id,
        });

        return createSubmission({
          submitterUserId: viewer.id,
          assignmentId: Number(assignmentId),
          description,
          pullRequestUrl,
        });
      } catch (e) {
        ctx.logger.error('Error while creating submission', { error: e });
        throw e;
      }
    },
  },
  submitSubmissionAgain: {
    description: 'Re-submits a submission for the viewer',
    args: {
      submissionId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      // Necesario para permisos.
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    type: SubmissionType,
    resolve: async (_, args, context) => {
      try {
        const { courseId: encodedCourseId, submissionId: encodedSubmissionId } = args;

        const courseId = fromGlobalIdAsNumber(encodedCourseId);
        const submissionId = fromGlobalIdAsNumber(encodedSubmissionId);

        const viewer = await getViewer(context);
        if (!viewer?.id) {
          throw new Error('Viewer not found');
        }

        context.logger.info('Marking submission as ready for review again', {
          courseId,
          submissionId,
        });

        const updatedSubmission = await updateSubmission(submissionId, {
          submittedAgainAt: new Date(),
        });

        return updatedSubmission;
      } catch (error) {
        context.logger.error('Error while updating submission', { error });
        throw error;
      }
    },
  },
  createReview: {
    type: new GraphQLNonNull(SubmissionType),
    description: 'Create a review within a submission',
    args: {
      submissionId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      // Required for permission check
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      grade: {
        type: GraphQLInt,
      },
      revisionRequested: {
        type: new GraphQLNonNull(GraphQLBoolean),
      },
    },
    resolve: async (_, args, context: AuthenticatedContext) => {
      try {
        const viewer = await getViewer(context);

        if (!viewer?.id) {
          throw new Error('Viewer not found');
        }

        const { submissionId: encodedSubmissionId, grade, revisionRequested } = args;

        const submissionId = fromGlobalIdAsNumber(encodedSubmissionId);
        const reviewerId = await findReviewerAndCheckIfIsReviewerForSubmission({
          submissionId,
          viewerId: Number(viewer.id),
        });

        await validateReviewOnCreation({ submissionId });

        context.logger.info(`Creating review with data: ` + JSON.stringify(args));

        await createReview({
          submissionId,
          grade,
          revisionRequested,
          reviewerId,
        });

        return findSubmission({ submissionId });
      } catch (error) {
        context.logger.error('Error performing mutation', { error });
        throw error;
      }
    },
  },
};

const validateReviewOnCreation = async ({ submissionId }: { submissionId: number }) => {
  const existingReview = await findAllReviews({
    forSubmissionId: submissionId,
  });

  if (existingReview.length > 0) {
    throw new Error('Review already created for submission');
  }
};
