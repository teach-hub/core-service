import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLBoolean,
  GraphQLNonNull,
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
        }
      : {}),
    name: {
      type: GraphQLString,
    },
    organization: {
      type: GraphQLString,
    },
    period: {
      type: GraphQLInt,
    },
    year: {
      type: GraphQLInt,
    },
    subjectId: {
      type: GraphQLInt,
    },
    active: {
      type: GraphQLBoolean,
    },
  };

  return fields;
};

const CourseType: GraphQLObjectType<unknown, Context> = new GraphQLObjectType({
  name: 'Course',
  description: 'A course within TeachHub',
  fields: getFields({ isUpdate: true }),
});

const findCourseCallback = (id: string) => {
  return findCourse({ courseId: id });
};


const courseMutations = buildEntityMutations({
  type: CourseType,
  keyName: 'Course',
  createOptions: {
    args: getFields({ isUpdate: false }),
    callback: createCourse,
  },
  updateOptions: {
    args: getFields({ isUpdate: true }),
    callback: updateCourse,
  },
  deleteOptions: {
    findCallback: findCourseCallback
  },
});

const courseFields = buildEntityFields({
  type: CourseType,
  keyName: 'Course',
  findCallback: findCourseCallback,
  findAllCallback: findAllCourses,
  countCallback: countCourses,
});

export { courseMutations, courseFields };
