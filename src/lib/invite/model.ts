import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

interface InviteAttributes {
  readonly id: number;
  readonly courseId: string;
  readonly roleId: string;
  readonly usedAt: Date;
}

class Invite extends Sequelize.Model<InviteAttributes> {

  static initialize = (db: Sequelize.Sequelize) => {
    return Invite.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        courseId: {
          type: Sequelize.NUMBER,
          field: 'course_id',
          allowNull: false,
        },
        roleId: {
          type: Sequelize.NUMBER,
          field: 'role_id',
          allowNull: false,
        },
        usedAt: {
          type: Sequelize.DATE,
          field: 'used_at',
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

  static associate = () => {};
}

export default Invite;
