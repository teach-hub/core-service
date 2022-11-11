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

  // Esta magia inicializa los modelos de la base de datos. Basicamente 
  // importamos y los iteramos ejecutandoles el `initialize`. Hacemos lo 
  // mismo con las asociaciones.
  Object.values(models).map(m => m.initialize(db));
  
  // Si tiene el metodo `associate()` definido es porque usa alguna asociacion.
  // Entonces necesitamos pasarle los otros modelos.
  Object.values(models).map(m => 'associate' in m && m.associate(models));
}

export {
  db,
  initializeDB
}


