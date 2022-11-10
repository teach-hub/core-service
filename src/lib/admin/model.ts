import Sequelize from 'sequelize';

import db from '../../db';
import { DatabaseConstants } from "../../consts";

class AdminUserModel extends Sequelize.Model {
  readonly email!: String;
  readonly password!: String;
  readonly name!: String;
  readonly lastName?: String;
}

AdminUserModel.init(
  {
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

export default AdminUserModel;
