import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

interface UserRoleAttributes {
  readonly id?: number;
  readonly roleId?: number;
  readonly userId?: number;
  readonly courseId?: number;
  readonly active?: boolean;
}

class UserRole extends Sequelize.Model<UserRoleAttributes> implements UserRoleAttributes {
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
          type: Sequelize.INTEGER,
          field: 'role_id',
        },
        userId: {
          type: Sequelize.INTEGER,
          field: 'user_id',
        },
        courseId: {
          type: Sequelize.INTEGER,
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
