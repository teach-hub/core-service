import {
  GraphQLID,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

import { fromGlobalId, toGlobalId } from '../../graphql/utils';

import { SubmissionFields, createSubmission } from '../submission/submissionsService';
import { findUser } from '../user/userService';
import { getViewer, UserType } from '../user/internalGraphql';

import type { Context } from '../../../src/types';
import type { GraphQLFieldConfigMap } from 'graphql';

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
    user: {
      type: new GraphQLNonNull(UserType),
      description: 'User who has made the submission',
      resolve: async submission => {
        const submitter =
          submission.userId && (await findUser({ userId: String(submission.userId) }));
        return submitter;
      },
    },
    pullRequestUrl: {
      type: new GraphQLNonNull(GraphQLString),
    },
    submittedAt: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Date when submission was created',
      resolve: s => s.createdAt && s.createdAt.toUTCString(),
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
          userId: viewer.id,
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
