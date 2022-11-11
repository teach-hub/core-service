import { Sequelize } from 'sequelize';

import CourseModel from './lib/course/adminCourse';
import SubjectModel from './lib/subject/subjectModel';

const DB_URL = process.env.DB_URL || 'postgres://postgres@localhost:5432/teachhub';

const db = new Sequelize(DB_URL);

console.log('Connected to db!');

const initializeDB = () => {
  let models = {
    CourseModel,
    SubjectModel
  }

  Object.values(models).map(m => m.initialize(db));
  Object.values(models).map(m => 'associate' in m && m.associate(models));
}

export {
  db,
  initializeDB
}


