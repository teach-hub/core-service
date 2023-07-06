import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

export type CoursePeriod = '1' | '2';

interface CourseAttributes {
  readonly id?: number;
  readonly name?: string;
  readonly githubOrganization?: string;
  readonly subjectId?: number;
  readonly period?: CoursePeriod;
  readonly year?: number;
  readonly active?: boolean;
}

class CourseModel extends Sequelize.Model<CourseAttributes> implements CourseAttributes {
  readonly id!: number;
  readonly name!: string;
  readonly githubOrganization!: string;
  readonly subjectId!: number;
  readonly period!: CoursePeriod;
  readonly year!: number;
  readonly active!: boolean;

  static initialize = (db: Sequelize.Sequelize) => {
    return CourseModel.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        githubOrganization: {
          type: Sequelize.TEXT,
          field: 'github_organization',
        },
        subjectId: {
          type: Sequelize.INTEGER,
          field: 'subject_id',
          allowNull: false,
        },
        period: {
          type: Sequelize.ENUM('1', '2'),
          allowNull: false,
        },
        year: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.COURSE,
        timestamps: false,
      }
    );
  };

  // FIXME. No copiar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate = (models: any) => {
    const { SubjectModel } = models;

    CourseModel.belongsTo(SubjectModel, { foreignKey: 'subject_id' });
  };
}

export default CourseModel;
