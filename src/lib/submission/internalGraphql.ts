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

export const SubmiteeUnionType = new GraphQLUnionType({
  name: 'SubmiteeUnionType',
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
    submitee: {
      type: new GraphQLNonNull(SubmiteeUnionType),
      description: 'User or group who has made the submission',
      resolve: async submission => {
        const submitter =
          submission.submiteeId &&
          (await findUser({ userId: String(submission.submiteeId) }));
        return submitter;
      },
    },
    reviewer: {
      type: ReviewerType,
      resolve: async (submission, _, ctx: Context) => {
        try {
          /* TODO: TH-164 reviewee may be user or group */
          const reviewer = await findReviewer({
            userId: submission.submiteeId,
            assignmentId: submission.assignmentId,
          });

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
  },
});

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
          submiteeId: viewer.id,
          assignmentId: Number(assignmentId),
          description,
          pullRequestUrl,
          createdAt: new Date(),
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
