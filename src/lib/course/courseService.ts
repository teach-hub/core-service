import Course, { CoursePeriod } from './courseModel';
import { OrderingOptions } from '../../utils';
import { IModelFields, ModelAttributes, ModelWhereQuery } from '../../sequelize/types';
import { Nullable, Optional } from '../../types';
import {
  countModels,
  createModel,
  existsModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

export interface CourseFields extends IModelFields, ModelAttributes<Course> {
  id: Optional<number>;
  name: Optional<string>;
  organization: Optional<string>;
  subjectId: Optional<number>;
  period: Optional<CoursePeriod>;
  year: Optional<number>;
  active: Optional<boolean>;
}

const buildModelFields = (course: Nullable<Course>): CourseFields => {
  return {
    id: course?.id,
    name: course?.name,
    organization: course?.githubOrganization,
    subjectId: course?.subjectId,
    period: course?.period,
    year: course?.year,
    active: course?.active,
  };
};

const buildQuery = (id: string): ModelWhereQuery<Course> => {
  return { id: Number(id) };
};

const fixData = (data: CourseFields) => {
  data.githubOrganization = data.organization;
  return data;
};

const validate = async (data: CourseFields) => {
  const courseAlreadyExists = await existsModel(Course, {
    year: data.year,
    period: String(data.period),
    subjectId: data.subjectId,
  });

  if (courseAlreadyExists)
    throw new Error("Course for subject in year and period already exists");
};

export async function createCourse(data: CourseFields): Promise<CourseFields> {
  data.active = true; // Always create active
  await validate(data);
  return createModel(Course, fixData(data), buildModelFields);
}

export async function updateCourse(
  id: string,
  data: CourseFields
): Promise<CourseFields> {
  await validate(data);
  return updateModel(Course, fixData(data), buildModelFields, buildQuery(id));
}

export async function countCourses(): Promise<number> {
  return countModels<Course>(Course);
}

export async function findCourse({
  courseId,
}: {
  courseId: string;
}): Promise<CourseFields> {
  return findModel(Course, buildModelFields, buildQuery(courseId));
}

export async function findAllCourses(options: OrderingOptions): Promise<CourseFields[]> {
  return findAllModels(Course, options, buildModelFields);
}
