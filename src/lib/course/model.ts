import Sequelize from 'sequelize';

import db from '../../db';
import { DatabaseConstants } from "../../consts";
import SubjectModel from '../subject/model';

class CourseModel extends Sequelize.Model {
  readonly id!: number;
  readonly name!: string;
  readonly githubOrganization!: string;
  readonly subjectId!: number;
  readonly period!: '1' | '2';
  readonly year!: number;
  readonly active!: boolean;
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
      type: Sequelize.ENUM('1', '2'),
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
    schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
    tableName: DatabaseConstants.TABLES.COURSE,
    timestamps: false,
  }
);

CourseModel.belongsTo(SubjectModel, { foreignKey: 'subject_id' })

export default CourseModel;
