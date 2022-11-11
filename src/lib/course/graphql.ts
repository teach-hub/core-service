import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLID,
  GraphQLBoolean,
  Source
} from 'graphql';

import { createCourse, findAllCourses, findCourse, updateCourse, countCourses } from './courseService';
import { RAArgs } from '../../graphql/utils';

const CourseType = new GraphQLObjectType({
  name: 'Course',
  description: 'A course within TeachHub',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    organization: { type: GraphQLString },
    period: { type: GraphQLString },
    year: { type: GraphQLInt },
    subjectId: { type: GraphQLInt },
    active: { type: GraphQLBoolean }
  }
});

const courseFields = {
  Course: {
    type: CourseType,
    args: { id: { type: GraphQLID }},
    resolve: async (_: Source, { id }: any) => findCourse({ courseId: id }),
  },
  allCourses: {
    type: new GraphQLList(CourseType),
    description: "List of courses on the whole application",
    args: RAArgs,
    resolve: async (_: Source, { page, perPage, sortField, sortOrder }: any) => {
      return findAllCourses({ page, perPage, sortField, sortOrder });
    }
  },
  _allCoursesMeta: {
    type: new GraphQLObjectType({
      name: 'CourseListMetadata',
      fields: { count: { type: GraphQLInt }}
    }),
    args: RAArgs,
    resolve: async () => {
      return { count: (await countCourses()) };
    }
  }
}

const courseMutations = {
  createCourse: {
    type: CourseType, // Output type
    description: 'Creates a new course assigning name and department code',
    args: {
      name: { type: GraphQLString },
      organization: { type: GraphQLString },
      period: { type: GraphQLInt },
      year: { type: GraphQLInt },
      subjectId: { type: GraphQLInt }
    },
    resolve: async (_: Source, { name, year, period, organization, subjectId }: any) => {
      console.log("Executing mutation createCourse");

      return await createCourse({ name, year, period, organization, subjectId });
    }
  },
  updateCourse: {
    type: CourseType,
    description: 'Update course record on TeachHub',
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      organization: { type: GraphQLString },
      period: { type: GraphQLInt },
      year: { type: GraphQLInt },
      subjectId: { type: GraphQLInt },
      active: { type: GraphQLBoolean }
    },
    resolve: async (_: Source, { id, ...rest }: any) => {
      console.log("Executing mutation updateCourse");

      return updateCourse(id, rest)
    },
  }
};

export {
  courseMutations,
  courseFields
}
