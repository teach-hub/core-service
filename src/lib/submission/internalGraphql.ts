import { GraphQLNonNull, GraphQLString, GraphQLObjectType } from 'graphql';

import { toGlobalId } from '../../graphql/utils';

import { findUser } from '../user/userService';
import { UserType } from '../user/internalGraphql';

export const SubmissionType = new GraphQLObjectType({
  name: 'SubmissionType',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: s =>
        toGlobalId({
          entityName: 'submission',
          dbId: String(s.id) as string,
        }),
    },
    description: {
      type: GraphQLString,
    },
    user: {
      type: new GraphQLNonNull(UserType),
      description: 'User who has made the submission',
      resolve: async (submission, _, context) => {
        const submitter = await findUser({ userId: submission.userId });
        return submitter;
      },
    },
    submittedAt: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Date when submission was created',
      resolve: s => (s.createdAt as Date).toUTCString(),
    },
  },
});
