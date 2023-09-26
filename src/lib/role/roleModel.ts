import {
  INTEGER,
  TEXT,
  BOOLEAN,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

import { DatabaseConstants } from '../../consts';

import type { Optional } from 'src/types';

class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare parentRoleId: Optional<number>;
  declare permissions: Optional<string>;
  declare active: boolean;
  declare isTeacher: Optional<boolean>;

  static initialize = (db: Sequelize) => {
    return Role.init(
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
        parentRoleId: {
          type: INTEGER,
          field: 'parent_role_id',
        },
        permissions: {
          type: TEXT,
        },
        isTeacher: {
          type: BOOLEAN,
          field: 'is_teacher',
        },
        active: {
          type: BOOLEAN,
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
