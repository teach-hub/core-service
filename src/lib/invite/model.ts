import {
  INTEGER,
  DATE,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

import { DatabaseConstants } from '../../consts';

import type { Optional } from 'src/types';

class Invite extends Model<InferAttributes<Invite>, InferCreationAttributes<Invite>> {
  declare id: CreationOptional<number>;
  declare courseId: number;
  declare roleId: number;
  declare expiresAt: Optional<Date>;

  static initialize = (db: Sequelize) => {
    return Invite.init(
      {
        id: {
          type: INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        courseId: {
          type: INTEGER,
          field: 'course_id',
          allowNull: false,
        },
        roleId: {
          type: INTEGER,
          field: 'role_id',
          allowNull: false,
        },
        expiresAt: {
          type: DATE,
          field: 'expires_at',
        },
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.INVITE,
        timestamps: false,
      }
    );
  };
}

export default Invite;
