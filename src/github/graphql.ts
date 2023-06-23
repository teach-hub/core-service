import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

export const UserPullRequestType = new GraphQLObjectType({
  name: 'UserPullRequestType',
  description: 'Pull request object has opened for a course',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
    },
    repositoryName: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});
