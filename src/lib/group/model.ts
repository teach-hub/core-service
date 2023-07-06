import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

interface GroupAttributes {
  readonly id?: number;
  readonly name?: string;
  readonly courseId?: number;
  readonly active?: boolean;
}

class Group extends Sequelize.Model<GroupAttributes> implements GroupAttributes {
  readonly id!: number;
  readonly name!: string;
  readonly courseId!: number;
  readonly active!: boolean;

  static initialize = (db: Sequelize.Sequelize) => {
    return Group.init(
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
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        courseId: {
          type: Sequelize.INTEGER,
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
