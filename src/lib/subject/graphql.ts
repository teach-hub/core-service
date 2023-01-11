import { buildEntityFields } from '../../graphql/fields';

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLID,
  Source,
  GraphQLBoolean,
} from 'graphql';

import {
  createSubject,
  findAllSubjects,
  findSubject,
  updateSubject,
  countSubjects,
} from './subjectService';

import { GraphqlObjectTypeFields } from '../../graphql/utils';
import { buildEntityMutations } from '../../graphql/mutations';

const getFields = (addIdd: boolean) => {
  const fields: GraphqlObjectTypeFields = {
    name: { type: new GraphQLNonNull(GraphQLString) },
    code: { type: new GraphQLNonNull(GraphQLString) },
    active: { type: GraphQLBoolean },
  };
  if (addIdd) {
    fields.id = { type: GraphQLID };
  }

  return fields;
};

const SubjectType = new GraphQLObjectType({
  name: 'Subject',
  description: 'A subject within TeachHub',
  fields: getFields(true),
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
  createFields: getFields(false),
  updateFields: getFields(true),
  createCallback: createSubject,
  updateCallback: updateSubject,
  findCallback: findSubjectCallback,
});

export { subjectMutations, subjectFields };
