import { Sequelize } from 'sequelize';

import CourseModel from './lib/course/courseModel';
import SubjectModel from './lib/subject/subjectModel';
import AdminModel from './lib/adminUser/adminModel';
import UserModel from './lib/user/userModel';
import RoleModel from './lib/role/roleModel';
import UserRoleModel from './lib/userRole/userRoleModel';

const DB_URL = process.env.DB_URL || 'postgres://postgres@localhost:5432/teachhub';

const db = new Sequelize(DB_URL);

console.log('Connected to db!');

const initializeDB = () => {
  let models = {
    CourseModel,
    SubjectModel,
    AdminModel,
    UserModel,
    RoleModel,
    UserRoleModel,
  };

  // Esta magia inicializa los modelos de la base de datos. Basicamente
  // importamos y los iteramos ejecutandoles el `initialize`. Hacemos lo
  // mismo con las asociaciones.
  Object.values(models).map(m => m.initialize(db));

  // Si tiene el metodo `associate()` definido es porque usa alguna asociacion.
  // Entonces necesitamos pasarle los otros modelos.
  Object.values(models).map(m => 'associate' in m && m.associate(models));
};

export { db, initializeDB };
