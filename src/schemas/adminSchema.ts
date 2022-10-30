import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLID,
} from 'graphql';

import { createSubject, findAllSubjects } from '../services/subject';

const SubjectType = new GraphQLObjectType({
  name: 'Subject',
  description: 'A subject within TeachHub',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    code: { type: GraphQLString }
  }
});

const ReactAdminArgs = {
  page: { type: GraphQLInt },
  perPage: { type: GraphQLInt },
  sortField: { type: GraphQLString },
  sortOrder: { type: GraphQLString },
}

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: 'Admin schema root query',
    fields: {
      Subject: {
        type: SubjectType,
        args: { id: { type: GraphQLID }}
      },
      allSubjects: {
        type: new GraphQLList(SubjectType),
        description: "List of subjects on the whole application",
        args: ReactAdminArgs,
        resolve: async () => {
          try {
            return findAllSubjects();
          } catch (e) {
            return { errors: ['failed'] }
          }
        }
      },
      _allSubjectsMeta: {
        type: new GraphQLObjectType({
          name: 'ListMetadata',
          fields: { count: { type: GraphQLInt }}
        }),
        args: ReactAdminArgs,
        resolve: () => ({ count: 1 })
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    description: 'Admin schema root mutation',
    fields: {
      // PoC: react-admin
      createSubject: {
        type: SubjectType, // Output type
        description: 'Creates a new subject assigning name and department code',
        args: {
          name: { type: new GraphQLNonNull(GraphQLString) },
          code: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: async (_, { name, code }) => {

          // XXX. Podriamos construir un wrapper para "generar" mutations.
          // Ahi podriamos poner cosas como el logger, etc.

          console.log("Executing mutation createSubject");

          return createSubject({ name, code });
        }
      }
    }
  })
});

export default schema;
