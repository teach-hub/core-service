import type { GraphQLFieldConfigMap } from 'graphql';
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql';

import { fromGlobalId, toGlobalId } from '../../graphql/utils';

import { createSubmission, SubmissionFields } from '../submission/submissionsService';
import { findUser } from '../user/userService';
import { getViewer, UserType } from '../user/internalGraphql';

import type { Context } from '../../../src/types';
import { dateToString } from '../../utils/dates';
import { ReviewerType } from '../reviewer/internalGraphql';
import { InternalGroupType } from '../group/internalGraphql';
import { findReviewer } from '../reviewer/service';
import { InternalReviewType } from '../review/internalGraphql';
import { findReview } from '../review/service';

export const SubmitterUnionType = new GraphQLUnionType({
  name: 'SubmitterUnionType',
  types: [UserType, InternalGroupType],
  resolveType: obj => {
    return 'file' in obj ? UserType : InternalGroupType;
  },
});

export const SubmissionType = new GraphQLObjectType<SubmissionFields, Context>({
  name: 'SubmissionType',
  fields: {
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
      resolve: async submission => {
        const submitter =
          submission.submitterId &&
          (await findUser({ userId: String(submission.submitterId) }));
        return submitter;
      },
    },
    reviewer: {
      type: ReviewerType,
      resolve: async (submission, _, ctx: Context) => {
        try {
          /* TODO: TH-164 reviewee may be user or group */
          const reviewer = await findSubmissionReviewer(submission);

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
      resolve: s => s.createdAt && dateToString(s.createdAt),
    },
    review: {
      type: InternalReviewType,
      resolve: async (submission, _, ctx: Context) => {
        try {
          const review = await findReview({
            submissionId: submission.id,
          });

          ctx.logger.info('Returning review', { review });

          return review;
        } catch (error) {
          ctx.logger.error('An error happened while returning review', { error });
          return null;
        }
      },
    },
    viewerCanReview: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: async (submission, _, ctx: Context) => {
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
  },
});

const findSubmissionReviewer = async (submission: SubmissionFields) => {
  return await findReviewer({
    revieweeId: submission.submitterId,
    assignmentId: submission.assignmentId,
  });
};

export const submissionMutations: GraphQLFieldConfigMap<null, Context> = {
  createSubmission: {
    description: 'Creates a new submission for the viewer',
    type: new GraphQLObjectType({
      name: 'CreateSubmissionResultType',
      fields: {
        success: {
          type: GraphQLBoolean,
        },
        errors: {
          type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
        },
      },
    }),
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

        if (!viewer.id) {
          throw new Error('Viewer not found');
        }

        ctx.logger.info('Creating submission for assignment', {
          assignmentId,
          userId: viewer.id,
        });

        await createSubmission({
          submitterUserId: viewer.id,
          assignmentId: Number(assignmentId),
          description,
          pullRequestUrl,
        });

        return {
          success: true,
          errors: [],
        };
      } catch (e) {
        ctx.logger.error('Error while creating submission', { error: e });
        return {
          success: false,
          errors: [`${e}`],
        };
      }
    },
  },
};
