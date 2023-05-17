import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

class AssignmentModel extends Sequelize.Model {
  readonly id!: number;
  readonly startDate!: Date;
  readonly endDate!: Date;
  readonly link!: string;
  readonly title!: string;
  readonly description!: string;
  readonly allowLateSubmissions!: boolean;
  readonly active!: boolean;
  readonly courseId!: number;

  static initialize = (db: Sequelize.Sequelize) => {
    return AssignmentModel.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        startDate: {
          type: Sequelize.DATE,
          field: 'start_date',
        },
        endDate: {
          type: Sequelize.DATE,
          field: 'end_date',
        },
        link: {
          type: Sequelize.TEXT,
        },
        title: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
        },
        allowLateSubmissions: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          field: 'allow_late_submissions',
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        courseId: {
          type: Sequelize.NUMBER,
          field: 'course_id',
          allowNull: false,
        },
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.ASSIGNMENT,
        timestamps: false,
      }
    );
  };

  static associate = (models: any) => {
    const { CourseModel } = models;

    AssignmentModel.belongsTo(CourseModel, { foreignKey: 'course_id' });
  };
}

export default AssignmentModel;
