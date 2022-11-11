;import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLID,
  Source,
} from 'graphql';

import {
  createSubject,
  findAllSubjects,
  findSubject,
  updateSubject,
  countSubjects,
} from './subjectService';

import { RAArgs } from '../../graphql/utils';

const SubjectType = new GraphQLObjectType({
  name: 'Subject',
  description: 'A subject within TeachHub',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    code: { type: GraphQLString }
  }
});

export const subjectFields = {
  Subject: {
    type: SubjectType,
    args: { id: { type: GraphQLID }},
    resolve: async (_: Source, { id }: any) => findSubject({ subjectId: id }),
  },
  allSubjects: {
    type: new GraphQLList(SubjectType),
    description: "List of subjects on the whole application",
    args: RAArgs,
    resolve: async (_: Source, { page, perPage, sortField, sortOrder }: any) => {
      return findAllSubjects({ page, perPage, sortField, sortOrder });
    }
  },
  _allSubjectsMeta: {
    type: new GraphQLObjectType({
      name: 'SubjectListMetadata',
      fields: { count: { type: GraphQLInt }}
    }),
    args: RAArgs,
    resolve: async () => {
      return { count: (await countSubjects()) };
    }
  }
}

export const subjectMutations = {
  createSubject: {
    type: SubjectType, // Output type
    description: 'Creates a new subject assigning name and department code',
    args: {
      name: { type: new GraphQLNonNull(GraphQLString) },
      code: { type: new GraphQLNonNull(GraphQLString) }
    },
    resolve: async (_: Source, { name, code }: any) => {
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
    resolve: async (_: Source, { id, ...rest }: any) => {
      console.log("Executing mutation updateSubject");

      return updateSubject(id, rest)
    }
  }
}
