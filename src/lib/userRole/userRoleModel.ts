import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

class UserRole extends Sequelize.Model {
  readonly id!: number;
  readonly roleId!: number;
  readonly userId!: number;
  readonly courseId!: number;
  readonly active!: boolean;

  static initialize = (db: Sequelize.Sequelize) => {
    return UserRole.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        roleId: {
          type: Sequelize.NUMBER,
          field: 'role_id',
        },
        userId: {
          type: Sequelize.NUMBER,
          field: 'user_id',
        },
        courseId: {
          type: Sequelize.NUMBER,
          field: 'course_id',
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.USER_ROLE,
        timestamps: false,
      }
    );
  };

  static associate = () => {};
}

export default UserRole;
