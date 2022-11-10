import { GraphQLSchema, GraphQLObjectType } from 'graphql';

import { subjectFields, subjectMutations } from '../lib/subject/graphql';
import { courseFields, courseMutations } from '../lib/course/graphql';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: 'Admin schema root query',
    fields: {
      ...subjectFields,
      ...courseFields,
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    description: 'Admin schema root mutation',
    fields: {
      ...subjectMutations,
      ...courseMutations,
    }
  })
});

export default schema;
