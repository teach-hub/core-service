import {
  INTEGER,
  TEXT,
  BOOLEAN,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

import { DatabaseConstants } from '../../consts';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare githubId: string;
  declare name: string;
  declare lastName: string;
  declare notificationEmail: string;
  declare file: string;
  declare active: boolean;

  static initialize = (db: Sequelize) => {
    return User.init(
      {
        id: {
          type: INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        githubId: {
          type: TEXT,
          field: 'github_id',
          allowNull: false,
        },
        name: {
          type: TEXT,
          allowNull: false,
        },
        lastName: {
          type: TEXT,
          field: 'last_name',
          allowNull: false,
        },
        notificationEmail: {
          type: TEXT,
          field: 'notification_email',
          allowNull: false,
        },
        /* Padron */
        file: {
          type: TEXT,
          allowNull: false,
        },
        active: {
          type: BOOLEAN,
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
