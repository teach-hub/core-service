import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLNonNull
} from 'graphql';


import { Subject } from './models';

const SubjectType = new GraphQLObjectType({
  name: 'SubjectType',
  description: 'A subject within TeachHub',
  fields: {
    name: { type: GraphQLString },
    code: { type: GraphQLString }
  }
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'Admin schema root query',
    fields: {
      subjects: {
        type: new GraphQLList(SubjectType),
        description: "List of subjects on the whole application",
        resolve: async () => {
          return Subject.findAll({ where: {} });
        }
      }
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    description: 'Admin schema root mutation',
    fields: {
      createSubject: {
        type: SubjectType, // Output type
        description: 'Creates a new subject assigning name and department code',
        args: {
          input: {
            type: new GraphQLInputObjectType({
              name: 'CreateSubjectInputType',
              fields: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                code: { type: new GraphQLNonNull(GraphQLString) }
              }
            })
          }
        },
        resolve: async (source, { input: { name, code }}, context) => {

          // XXX. Podriamos construir un wrapper para "generar" mutations.
          // Ahi podriamos poner cosas como el logger, etc.

          console.log("Executing mutation createSubject");

          return Subject.create({ name, code });
        }
      }
    }
  })
});

export default schema;
