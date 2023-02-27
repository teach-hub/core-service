import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLBoolean,
  GraphQLNonNull,
  Source,
} from 'graphql';

import {
  createCourse,
  findAllCourses,
  findCourse,
  updateCourse,
  countCourses,
} from './courseService';

import { buildEntityFields } from '../../graphql/fields';
import { buildEntityMutations } from '../../graphql/mutations';

import type { Context } from 'src/types';

const getFields = ({ isUpdate }: { isUpdate: boolean }) => {
  const fields = {
    ...(isUpdate
      ? {
          id: { type: new GraphQLNonNull(GraphQLID) },
          name: { type: new GraphQLNonNull(GraphQLString) },
        }
      : {}),
    name: { type: GraphQLString },
    organization: { type: GraphQLString },
    period: { type: GraphQLInt },
    year: { type: GraphQLInt },
    subjectId: { type: GraphQLInt },
    active: { type: GraphQLBoolean },
  };

  return fields;
};

const CourseType: GraphQLObjectType<Source, Context> = new GraphQLObjectType({
  name: 'Course',
  description: 'A course within TeachHub',
  fields: getFields({ isUpdate: true }),
});

const findCourseCallback = (id: string) => {
  return findCourse({ courseId: id });
};

const courseFields = buildEntityFields({
  type: CourseType,
  keyName: 'Course',
  typeName: 'course',
  findCallback: findCourseCallback,
  findAllCallback: findAllCourses,
  countCallback: countCourses,
});

const courseMutations = buildEntityMutations({
  type: CourseType,
  keyName: 'Course',
  typeName: 'course',
  createFields: getFields({ isUpdate: false }),
  updateFields: getFields({ isUpdate: true }),
  createCallback: createCourse,
  updateCallback: updateCourse,
  findCallback: findCourseCallback,
});

export { courseMutations, courseFields };
