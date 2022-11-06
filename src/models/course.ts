import Sequelize from 'sequelize';

import db from '../db';
import SubjectModel from './subject';

class CourseModel extends Sequelize.Model {
  readonly id!: Number;
  readonly name!: String;
  readonly githubOrganization!: String;
  readonly period!: Number
  readonly year!: Number
  readonly active!: Boolean
}

CourseModel.init(
  {
    id: Sequelize.INTEGER,
    name: Sequelize.TEXT,
    githubOrganization: Sequelize.TEXT,
    period: Sequelize.INTEGER,
    year: Sequelize.INTEGER,
    active: Sequelize.BOOLEAN
  },
  {
    sequelize: db,
    schema: 'teachhub',
    tableName: 'courses',
    timestamps: false,
  }
);

CourseModel.hasOne(SubjectModel, { foreignKey: 'subject_id' })

export default CourseModel;
