import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLID,
} from 'graphql';

import {
  createSubject,
  findAllSubjects,
  findSubject,
  updateSubject,
  countSubjects,
} from '../services/subject';

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

  // En realidad no es un GraphQLString, solamente puede ser uno
  // de los campos que exponemos en SubjectType. O sea, el tipo
  // real seria: 'id' | 'name' | 'code'.

  sortField: { type: GraphQLString },

  // "ASC" | "DESC"

  sortOrder: { type: GraphQLString },
}

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: 'Admin schema root query',
    fields: {
      Subject: {
        type: SubjectType,
        args: { id: { type: GraphQLID }},
        resolve: async (_, { id }) => findSubject({ subjectId: id }),
      },
      allSubjects: {
        type: new GraphQLList(SubjectType),
        description: "List of subjects on the whole application",
        args: ReactAdminArgs,
        resolve: async (_, { page, perPage, sortField, sortOrder }) => {
          return findAllSubjects({ page, perPage, sortField, sortOrder });
        }
      },
      _allSubjectsMeta: {
        type: new GraphQLObjectType({
          name: 'ListMetadata',
          fields: { count: { type: GraphQLInt }}
        }),
        args: ReactAdminArgs,
        resolve: async () => {
          return { count: (await countSubjects()) };
        }
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    description: 'Admin schema root mutation',
    fields: {
      createSubject: {
        type: SubjectType, // Output type
        description: 'Creates a new subject assigning name and department code',
        args: {
          name: { type: new GraphQLNonNull(GraphQLString) },
          code: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: async (_, { name, code }) => {
          console.log("Executing mutation createSubject");

          return await createSubject({ name, code });
        }
      },
      updateSubject: {
        type: SubjectType,
        description: 'Update subject record on TeachHub',
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          name: { type: new GraphQLNonNull(GraphQLString) },
          code: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: async (_, { id, name, code }) => {
          console.log("Executing mutation updateSubject");

          return updateSubject(id, { name, code })
        },
      },
    }
  })
});

export default schema;