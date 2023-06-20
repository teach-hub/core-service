import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

interface RoleAttributes {
  readonly id?: number;
  readonly name?: string;
  readonly parentRoleId?: number;
  readonly permissions?: string;
  readonly active?: boolean;
  readonly isTeacher?: boolean;
}

class Role extends Sequelize.Model<RoleAttributes> implements RoleAttributes {
  readonly id!: number;
  readonly name!: string;
  readonly parentRoleId!: number;
  readonly permissions!: string;
  readonly active!: boolean;
  readonly isTeacher!: boolean;

  static initialize = (db: Sequelize.Sequelize) => {
    return Role.init(
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
        parentRoleId: {
          type: Sequelize.INTEGER,
          field: 'parent_role_id',
        },
        permissions: {
          type: Sequelize.STRING,
        },
        isTeacher: {
          type: Sequelize.BOOLEAN,
          field: 'is_teacher',
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.ROLE,
        timestamps: false,
      }
    );
  };
}

export default Role;
