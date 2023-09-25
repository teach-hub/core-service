import { Op } from 'sequelize';
import { omit } from 'lodash';

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
import type { Optional } from '../../types';

export type CourseFields = {
  id: number;
  name: string;
  organization: Optional<string>;
  subjectId: number;
  period: CoursePeriod;
  year: number;
  active: boolean;
};

const buildModelFields = (course: Course): CourseFields => {
  return {
    id: course.id,
    name: course.name,
    organization: course.githubOrganization,
    subjectId: course.subjectId,
    period: course.period,
    year: course.year,
    active: course.active,
  };
};

const buildQuery = (id: number): WhereOptions<Course> => {
  return { id };
};

const fixData = (data: CourseFields) => {
  return { ...data, githubOrganization: data.organization ?? '' };
};

const validate = async (data: CourseFields): Promise<void> => {
  const courseAlreadyExists = await existsModel(Course, {
    year: data.year,
    name: data.name,
    period: String(data.period),
    subjectId: data.subjectId,
    ...(data.id ? { id: { [Op.not]: data.id } } : {}),
  });

  if (courseAlreadyExists) {
    throw new Error('Course for subject in year and period already exists');
  }
};

export async function createCourse(data: CourseFields): Promise<CourseFields | null> {
  const dataWithActiveFlag = { ...data, active: true };

  await validate(dataWithActiveFlag);

  return createModel(Course, fixData(dataWithActiveFlag), buildModelFields);
}

export async function updateCourse(
  id: number,
  data: CourseFields
): Promise<CourseFields> {
  await validate({ id: Number(id), ...omit(data, 'id') });

  return updateModel(Course, fixData(data), buildModelFields, buildQuery(id));
}

export async function countCourses(): Promise<number> {
  return countModels<Course>(Course);
}

export async function findCourse({
  courseId,
}: {
  courseId: number;
}): Promise<CourseFields | null> {
  return findModel(Course, buildModelFields, buildQuery(courseId));
}

export async function findAllCourses(options: OrderingOptions): Promise<CourseFields[]> {
  return findAllModels(Course, options, buildModelFields);
}
