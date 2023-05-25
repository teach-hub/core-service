import Course, { CoursePeriod } from './courseModel';
import {
  countModels,
  createModel,
  existsModel,
  findAllModels,
  findModel,
  updateModel,
} from '../../sequelize/serviceUtils';

import type { OrderingOptions } from '../../utils';
import type { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';
import type { Nullable, Optional } from '../../types';

export type CourseFields = {
  id: Optional<number>;
  name: Optional<string>;
  organization: Optional<string>;
  subjectId: Optional<number>;
  period: Optional<CoursePeriod>;
  year: Optional<number>;
  active: Optional<boolean>;
};

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

const buildQuery = (id: string): WhereOptions<Course> => {
  return { id: Number(id) };
};

const fixData = (data: CourseFields) => {
  return { ...data, githubOrganization: data.organization ?? '' };
};

const validate = async (data: CourseFields): Promise<void> => {
  const courseAlreadyExists = await existsModel(Course, {
    year: data.year,
    period: String(data.period),
    subjectId: data.subjectId,
    ...(data.id ? { id: { [Op.not]: data.id } } : {}),
  });

  if (courseAlreadyExists) {
    throw new Error('Course for subject in year and period already exists');
  }
};

export async function createCourse(data: CourseFields): Promise<CourseFields> {
  const dataWithActiveFlag = { ...data, active: true };

  await validate(dataWithActiveFlag);

  return createModel(Course, fixData(dataWithActiveFlag), buildModelFields);
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
