import {
  GraphQLFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';

import { findUser } from '../user/userService';
import { getViewer, UserType } from '../user/internalGraphql';
import { findUserRole } from '../userRole/userRoleService';
import { fromGlobalId, toGlobalId } from '../../graphql/utils';
import { createReviewers } from '../reviewer/service';

import type { ReviewerFields } from '../reviewer/service';
import type { Context } from '../../types';

export const ReviewerPreviewType = new GraphQLObjectType<ReviewerFields, Context>({
  name: 'ReviewerPreviewType',
  description: 'Assignment reviewer.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the reviewer.',
      resolve: s => {
        return toGlobalId({
          entityName: 'reviewer',
          dbId: String(s.id),
        });
      },
    },
    reviewer: {
      type: new GraphQLNonNull(UserType),
      description: 'The id of the reviewer user role.',
      resolve: async reviewer => {
        if (!reviewer.reviewerUserId) {
          throw new Error();
        }

        const r = await findUser({ userId: String(reviewer.reviewerUserId) });

        return r;

      },
    },
    reviewee: {
      type: new GraphQLNonNull(UserType),
      description: 'The reviewee user.',
      resolve: async reviewer => {
        return findUser({ userId: String(reviewer.revieweeUserId) });
      },
    },
  },
});

export const ReviewerType = new GraphQLObjectType<ReviewerFields, Context>({
  name: 'ReviewerType',
  description: 'Assignment reviewer.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the reviewer.',
      resolve: s => {
        return toGlobalId({
          entityName: 'reviewer',
          dbId: String(s.id),
        });
      },
    },
    reviewer: {
      type: new GraphQLNonNull(UserType),
      description: 'The id of the reviewer user role.',
      resolve: async reviewer => {
        if (!reviewer.reviewerUserId) {
          throw new Error();
        }

        return findUser({ userId: String(reviewer.reviewerUserId) });
      },
    },
    reviewee: {
      type: new GraphQLNonNull(UserType),
      description: 'The reviewee user.',
      resolve: async reviewer => {
        return findUser({ userId: String(reviewer.revieweeUserId) });
      },
    },
  },
});

const assignReviewerArgs = {
  input: {
    type: new GraphQLInputObjectType({
      name: 'AssignReviewersInputType',
      fields: {
        assignmentId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'ID of the assignment where assign the reviewers to.',
        },
        reviewers: {
          type: new GraphQLNonNull(
            new GraphQLList(
              new GraphQLNonNull(
                new GraphQLInputObjectType({
                  name: 'ReviewersAssignmentInputType',
                  fields: {
                    reviewerUserId: {
                      type: new GraphQLNonNull(GraphQLID),
                      description: 'The id of the reviewer user.',
                    },
                    revieweeUserId: {
                      type: new GraphQLNonNull(GraphQLID),
                      description: 'The id of the reviewer user.',
                    },
                  },
                })
              )
            )
          ),
        },
      },
    }),
  },
};

export const reviewerMutations: GraphQLFieldConfigMap<null, Context> = {
  assignReviewers: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReviewerType))),
    args: assignReviewerArgs,
    resolve: async (_, args, context) => {
      try {
        const {
          input: { assignmentId: encodedAssignmentId, reviewers },
        } = args;

        const viewer = getViewer(context);

        if (!viewer) {
          throw new Error('Viewer not found!');
        }

        const reviewerFields: ReviewerFields[] = reviewers.map((reviewer: { reviewerUserId: string, revieweeUserId: string }) => {
          return {
            reviewerUserId: fromGlobalId(reviewer.reviewerUserId).dbId,
            revieweeUserId: fromGlobalId(reviewer.revieweeUserId).dbId,
            assignmentId: fromGlobalId(encodedAssignmentId).dbId,
          }
        });

        context.logger.info('Assigning reviewers in assignment', { encodedAssignmentId, reviewerFields });

        return await createReviewers(reviewerFields);
      } catch(e) {
        context.logger.error('Error on assignReviewers mutation', { error: String(e) });
        return [];
      }
    }
  }
}
