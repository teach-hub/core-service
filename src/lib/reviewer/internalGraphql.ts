import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLUnionType,
} from 'graphql';

import { findUser } from '../user/userService';
import { findGroup } from '../group/service';
import { UserType } from '../user/internalGraphql';
import { InternalGroupType } from '../group/internalGraphql';

import { toGlobalId } from '../../graphql/utils';

import type { Context } from '../../types';

export const RevieweeUnionType = new GraphQLUnionType({
  name: 'RevieweeUnionType',
  types: [UserType, InternalGroupType],
  resolveType: obj => {
    return 'file' in obj ? UserType : InternalGroupType;
  },
});

export const ReviewerPreviewType = new GraphQLObjectType<
  { revieweeId: number; reviewerUserId: number; isGroup?: boolean; id: string },
  Context
>({
  name: 'ReviewerPreviewType',
  description: 'Assignment reviewer.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the reviewer.',
      resolve: s => {
        return toGlobalId({
          entityName: 'reviewer',
          dbId: s.id,
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

        const r = await findUser({ userId: reviewer.reviewerUserId });

        return r;
      },
    },
    reviewee: {
      type: new GraphQLNonNull(RevieweeUnionType),
      description: 'The reviewee user.',
      resolve: async reviewer => {
        if (reviewer.isGroup) {
          return findGroup({ groupId: reviewer.revieweeId });
        } else {
          return findUser({ userId: reviewer.revieweeId });
        }
      },
    },
  },
});

export const ReviewerType = new GraphQLObjectType<
  { revieweeId: number; reviewerUserId: number; isGroup?: boolean; id: string },
  Context
>({
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
          throw new Error('There is no reviewer user id');
        }

        return findUser({ userId: reviewer.reviewerUserId });
      },
    },
    reviewee: {
      type: new GraphQLNonNull(RevieweeUnionType),
      description: 'The reviewee user.',
      resolve: async (reviewer, _, ctx) => {
        ctx.logger.info('Resolving reviewee for', reviewer);

        if (reviewer.isGroup) {
          return findGroup({ groupId: reviewer.revieweeId });
        } else {
          return findUser({ userId: reviewer.revieweeId });
        }
      },
    },
  },
});

export const AssignReviewersInputType = {
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
                    revieweeId: {
                      type: new GraphQLNonNull(GraphQLID),
                      description: 'ID of the reviewee user or group.',
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
