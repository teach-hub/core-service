import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

interface UserAttributes {
  readonly id: number;
  readonly githubId: string;
  readonly name: string;
  readonly lastName: string;
  readonly notificationEmail: string;
  readonly file: string;
  readonly active: boolean;
}

class User extends Sequelize.Model<UserAttributes> implements UserAttributes {

  readonly id!: number;
  readonly githubId!: string;
  readonly name!: string;
  readonly lastName!: string;
  readonly notificationEmail!: string;
  readonly file!: string;
  readonly active!: boolean;

  static initialize = (db: Sequelize.Sequelize) => {
    return User.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        githubId: {
          type: Sequelize.TEXT,
          field: 'github_id',
          allowNull: false,
        },
        name: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        lastName: {
          type: Sequelize.TEXT,
          field: 'last_name',
          allowNull: false,
        },
        notificationEmail: {
          type: Sequelize.TEXT,
          field: 'notification_email',
          allowNull: false,
        },
        /* Padron */
        file: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.USER,
        timestamps: false,
      }
    );
  };
}

export default User;
