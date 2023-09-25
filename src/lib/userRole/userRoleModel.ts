import {
  INTEGER,
  BOOLEAN,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

import { DatabaseConstants } from '../../consts';

class UserRole extends Model<InferAttributes<UserRole>, InferCreationAttributes<UserRole>> {
  declare id: CreationOptional<number>;
  declare roleId: number;
  declare userId: number;
  declare courseId: number;
  declare active: boolean;

  static initialize = (db: Sequelize) => {
    return UserRole.init(
      {
        id: {
          type: INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        roleId: {
          type: INTEGER,
          field: 'role_id',
          allowNull: false
        },
        userId: {
          type: INTEGER,
          field: 'user_id',
          allowNull: false
        },
        courseId: {
          type: INTEGER,
          field: 'course_id',
          allowNull: false
        },
        active: {
          type: BOOLEAN,
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
}

export default UserRole;
