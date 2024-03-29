import { Sequelize } from 'sequelize';

import CourseModel from './lib/course/courseModel';
import SubjectModel from './lib/subject/subjectModel';
import AdminModel from './lib/adminUser/adminModel';
import UserModel from './lib/user/userModel';
import RoleModel from './lib/role/roleModel';
import UserRoleModel from './lib/userRole/userRoleModel';
import AssignmentModel from './lib/assignment/assignmentModel';
import InviteModel from './lib/invite/model';
import SubmissionModel from './lib/submission/model';
import RepositoryModel from './lib/repository/model';
import ReviewerModel from './lib/reviewer/model';
import ReviewModel from './lib/review/model';
import GroupModel from './lib/group/model';
import GroupParticipantModel from './lib/groupParticipant/model';

import logger from './logger';

const DB_URL = `postgres://${process.env.DB_URL || 'postgres@localhost:5432/teachhub'}`;

const db = new Sequelize(DB_URL, { logging: false });

logger.info('Connected to db!');

const initializeModels = () => {
  const models = {
    CourseModel,
    SubjectModel,
    AdminModel,
    UserModel,
    RoleModel,
    UserRoleModel,
    AssignmentModel,
    InviteModel,
    SubmissionModel,
    RepositoryModel,
    GroupModel,
    GroupParticipantModel,
    ReviewerModel,
    ReviewModel,
  };

  // Esta magia inicializa los modelos de la base de datos. Basicamente
  // importamos y los iteramos ejecutandoles el `initialize`. Hacemos lo
  // mismo con las asociaciones.
  Object.values(models).map(m => m.initialize(db));

  // Si tiene el metodo `associate()` definido es porque usa alguna asociacion.
  // Entonces necesitamos pasarle los otros modelos.
  Object.values(models).map(m => 'associate' in m && m.associate(models));

  logger.info('db models ready!');
};

export { db, initializeModels };
