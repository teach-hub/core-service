import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLID,
  GraphQLBoolean,
  GraphQLNonNull,
  Source,
} from "graphql";

import {
  createCourse,
  findAllCourses,
  findCourse,
  updateCourse,
  countCourses,
} from "./courseService";

import { GraphqlObjectTypeFields } from "../../graphql/utils";
import { buildEntityFields } from "../../graphql/fields";
import { buildEntityMutations } from "../../graphql/mutations";

const getFields = (isUpdate: boolean) => {
  const fields: GraphqlObjectTypeFields = {
    name: { type: GraphQLString },
    organization: { type: GraphQLString },
    period: { type: GraphQLInt },
    year: { type: GraphQLInt },
    subjectId: { type: GraphQLInt },
    active: { type: GraphQLBoolean },
  };
  if (isUpdate) {
    fields.id = { type: new GraphQLNonNull(GraphQLID) };
    fields.name = { type: new GraphQLNonNull(GraphQLString) };
  }

  return fields;
};

const CourseType = new GraphQLObjectType({
  name: "Course",
  description: "A course within TeachHub",
  fields: getFields(true),
});

const findCourseCallback = (id: string) => {
  return findCourse({ courseId: id });
};

const courseFields = buildEntityFields({
  type: CourseType,
  keyName: "Course",
  typeName: "course",
  findCallback: findCourseCallback,
  findAllCallback: findAllCourses,
  countCallback: countCourses,
});
const courseMutations = buildEntityMutations({
  type: CourseType,
  keyName: "Course",
  typeName: "course",
  createFields: getFields(false),
  updateFields: getFields(true),
  createCallback: createCourse,
  updateCallback: updateCourse,
  findCallback: findCourseCallback,
});

export { courseMutations, courseFields };
