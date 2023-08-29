import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

interface InviteAttributes {
  readonly id?: number;
  readonly courseId?: number;
  readonly roleId?: number;
  readonly expiresAt?: Date;
}

class Invite extends Sequelize.Model<InviteAttributes> {
  readonly id!: number;
  readonly courseId!: number;
  readonly roleId!: number;
  readonly expiresAt!: Date;

  static initialize = (db: Sequelize.Sequelize) => {
    return Invite.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        courseId: {
          type: Sequelize.INTEGER,
          field: 'course_id',
          allowNull: false,
        },
        roleId: {
          type: Sequelize.INTEGER,
          field: 'role_id',
          allowNull: false,
        },
        expiresAt: {
          type: Sequelize.DATE,
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
