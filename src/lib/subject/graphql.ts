;import {
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
} from './service';

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
};

export const subjectFields = {
  Subject: {
    type: SubjectType,
    args: { id: { type: GraphQLID }},
    resolve: async (_: any, { id }: any) => findSubject({ subjectId: id }),
  },
  allSubjects: {
    type: new GraphQLList(SubjectType),
    description: "List of subjects on the whole application",
    args: ReactAdminArgs,
    resolve: async (_: any, { page, perPage, sortField, sortOrder }: any) => {
      return findAllSubjects({ page, perPage, sortField, sortOrder });
    }
  },
  _allSubjectsMeta: {
    type: new GraphQLObjectType({
      name: 'SubjectListMetadata',
      fields: { count: { type: GraphQLInt }}
    }),
    args: ReactAdminArgs,
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
    resolve: async (_: any, { name, code }: any) => {
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
    resolve: async (_: any, { id, ...rest }: any) => {
      console.log("Executing mutation updateSubject");

      return updateSubject(id, rest)
    }
  }
}
