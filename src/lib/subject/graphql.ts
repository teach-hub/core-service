import { buildEntityFields } from '../../graphql/fields';

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean,
} from 'graphql';

import {
  createSubject,
  findAllSubjects,
  findSubject,
  updateSubject,
  countSubjects,
} from './subjectService';

import { buildEntityMutations } from '../../graphql/mutations';

import type { Context } from 'src/types';

const getFields = ({ addId }: { addId: boolean }) => ({
  ...(addId ? { id: { type: GraphQLID } } : {}),
  name: { type: new GraphQLNonNull(GraphQLString) },
  code: { type: new GraphQLNonNull(GraphQLString) },
  active: { type: GraphQLBoolean },
});

export const SubjectType: GraphQLObjectType<unknown, Context> = new GraphQLObjectType({
  name: 'Subject',
  description: 'A subject within TeachHub',
  fields: getFields({ addId: true }),
});

const findSubjectCallback = (id: number) => {
  return findSubject({ subjectId: id });
};

const subjectFields = buildEntityFields({
  type: SubjectType,
  keyName: 'Subject',
  findCallback: findSubjectCallback,
  findAllCallback: findAllSubjects,
  countCallback: countSubjects,
});

const subjectMutations = buildEntityMutations({
  entityGraphQLType: SubjectType,
  entityName: 'Subject',
  createOptions: {
    args: getFields({ addId: false }),
    callback: createSubject,
  },
  updateOptions: {
    args: getFields({ addId: true }),
    callback: updateSubject,
  },
  deleteOptions: {
    findCallback: findSubjectCallback,
  },
});

export { subjectMutations, subjectFields };
