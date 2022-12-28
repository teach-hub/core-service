import Sequelize from 'sequelize';

import { DatabaseConstants } from "../../consts";

class Role extends Sequelize.Model {
  readonly id!: number;
  readonly name!: string;
  readonly parentRoleId!: number;
  readonly permissions!: string;
  readonly active!: boolean;

  static initialize = (db: Sequelize.Sequelize) => {
    return Role.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        parentRoleId: {
          type: Sequelize.NUMBER,
          field: 'parent_role_id',
        },
        permissions: {
          type: Sequelize.STRING
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false
        }
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.ROLE,
        timestamps: false,
      }
    );
  }

  static associate = () => {
  }
}

export default Role;
