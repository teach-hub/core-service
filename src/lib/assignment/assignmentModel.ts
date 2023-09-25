import {
  INTEGER,
  DATE,
  TEXT,
  BOOLEAN,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

import { DatabaseConstants } from '../../consts';

class Assignment extends Model<InferAttributes<Assignment>, InferCreationAttributes<Assignment>> {

  declare id: CreationOptional<number>;
  declare startDate: Date | undefined;
  declare endDate: Date | undefined;
  declare link: string | undefined;
  declare title: string;
  declare courseId: number;
  declare description: string | undefined;
  declare allowLateSubmissions: boolean;
  declare active: boolean;
  declare isGroup: boolean;

  static initialize = (db: Sequelize) => {
    return Assignment.init(
      {
        id: {
          type: INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        startDate: {
          type: DATE,
          field: 'start_date',
        },
        endDate: {
          type: DATE,
          field: 'end_date',
        },
        link: {
          type: TEXT,
        },
        title: {
          type: TEXT,
          allowNull: false,
        },
        description: {
          type: TEXT,
        },
        allowLateSubmissions: {
          type: BOOLEAN,
          allowNull: false,
          field: 'allow_late_submissions',
        },
        active: {
          type: BOOLEAN,
          allowNull: false,
        },
        isGroup: {
          type: BOOLEAN,
          allowNull: false,
          field: 'is_group',
        },
        courseId: {
          type: INTEGER,
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

  // FIXME. No copiar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate = (models: any) => {
    const { CourseModel } = models;

    Assignment.belongsTo(CourseModel, { foreignKey: 'course_id' });
  };
}

export default Assignment;
