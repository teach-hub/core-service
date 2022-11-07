import Sequelize from 'sequelize';

import db from '../db';
import SubjectModel from './subject';

class CourseModel extends Sequelize.Model {
  readonly id!: Number;
  readonly name!: String;
  readonly githubOrganization!: String;
  readonly subjectId!: Number;
  readonly period!: Number
  readonly year!: Number
  readonly active!: Boolean
}

CourseModel.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    githubOrganization: {
      type: Sequelize.TEXT,
      field: 'github_organization'
    },
    subjectId: {
      type: Sequelize.NUMBER,
      field: 'subject_id',
      allowNull: false,
    },
    period: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    active: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    }
  },
  {
    sequelize: db,
    schema: 'teachhub',
    tableName: 'courses',
    timestamps: false,
  }
);

CourseModel.belongsTo(SubjectModel, { foreignKey: 'subject_id' })

export default CourseModel;
