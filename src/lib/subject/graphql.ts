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

const findSubjectCallback = (id: string) => {
  return findSubject({ subjectId: id });
};

const subjectFields = buildEntityFields({
  type: SubjectType,
  keyName: 'Subject',
  typeName: 'subject',
  findCallback: findSubjectCallback,
  findAllCallback: findAllSubjects,
  countCallback: countSubjects,
});

const subjectMutations = buildEntityMutations({
  type: SubjectType,
  keyName: 'Subject',
  typeName: 'subject',
  createFields: getFields({ addId: false }),
  updateFields: getFields({ addId: true }),
  createCallback: createSubject,
  updateCallback: updateSubject,
  findCallback: findSubjectCallback,
});

export { subjectMutations, subjectFields };
