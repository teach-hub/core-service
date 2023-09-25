import {
  INTEGER,
  TEXT,
  BOOLEAN,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

import { DatabaseConstants } from '../../consts';

class Group extends Model<InferAttributes<Group>, InferCreationAttributes<Group>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare courseId: number;
  declare active: boolean;

  static initialize = (db: Sequelize) => {
    return Group.init(
      {
        id: {
          type: INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: TEXT,
          allowNull: false,
        },
        active: {
          type: BOOLEAN,
          allowNull: false,
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
        tableName: DatabaseConstants.TABLES.GROUP,
        timestamps: false,
      }
    );
  };

  // FIXME. No copiar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate = (models: any) => {
    const { CourseModel } = models;

    Group.belongsTo(CourseModel, { foreignKey: 'course_id' });
  };
}

export default Group;
