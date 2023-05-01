import { GraphQLNonNull, GraphQLString } from 'graphql';

export const inviteMutations = {
  generateInvitationLink: {
    type: new GraphQLNonNull(GraphQLString),
    description: 'Generates an invitation link',
    args: {},
    resolve: () => {},
  },
};
