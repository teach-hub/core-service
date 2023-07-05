import { GraphQLID, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { findUser } from '../user/userService';
import { UserType } from '../user/internalGraphql';
import { findUserRole } from '../userRole/userRoleService';
import { toGlobalId } from '../../graphql/utils';

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
        if (!reviewer.reviewerUserRoleId) {
          throw new Error();
        }

        const reviewerUserRole = await findUserRole({
          id: String(reviewer.reviewerUserRoleId),
        });
        return findUser({ userId: String(reviewerUserRole.userId) });
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
    reviewerUserRole: {
      type: new GraphQLNonNull(UserType),
      description: 'The id of the reviewer user role.',
      resolve: async reviewer => {
        if (!reviewer.reviewerUserRoleId) {
          throw new Error();
        }

        const reviewerUserRole = await findUserRole({
          id: String(reviewer.reviewerUserRoleId),
        });
        return findUser({ userId: String(reviewerUserRole.userId) });
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
