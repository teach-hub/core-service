import {
  INTEGER,
  TEXT,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

import { DatabaseConstants } from '../../consts';

class AdminUser extends Model<
  InferAttributes<AdminUser>,
  InferCreationAttributes<AdminUser>
> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare password: string;
  declare name: string;
  declare lastName: string;

  static initialize = (db: Sequelize) => {
    return AdminUser.init(
      {
        id: {
          type: INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        email: TEXT,
        password: TEXT,
        name: TEXT,
        lastName: {
          type: TEXT,
          field: 'last_name',
        },
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.ADMIN_USER,
        timestamps: false,
      }
    );
  };
}

export default AdminUser;
