import Sequelize from 'sequelize';

import { DatabaseConstants } from "../../consts";

class AdminUserModel extends Sequelize.Model {
  readonly id!: number;
  readonly email!: string;
  readonly password!: string;
  readonly name!: string;
  readonly lastName?: string;

  static initialize = (db: Sequelize.Sequelize) => {
    return AdminUserModel.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        email: Sequelize.TEXT,
        password: Sequelize.TEXT,
        name: Sequelize.TEXT,
        lastName: {
          type: Sequelize.TEXT,
          field: 'last_name'
        }
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.ADMIN_USER,
        timestamps: false,
      }
    );
  }

}

export default AdminUserModel;
