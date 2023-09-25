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

import type { Optional } from 'src/types';

class Repository extends Model<InferAttributes<Repository>, InferCreationAttributes<Repository>> {
  declare id: CreationOptional<number>;
  declare courseId: number;
  declare userId: Optional<number>;
  declare groupId: Optional<number>;
  declare githubId: number;
  declare name: string;
  declare active: boolean;

  static initialize = (db: Sequelize) => {
    return Repository.init(
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
        userId: {
          type: INTEGER,
          field: 'user_id',
        },
        groupId: {
          type: INTEGER,
          field: 'group_id',
        },
        githubId: {
          field: 'github_id',
          type: TEXT,
          allowNull: false,
        },
        name: {
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
        tableName: DatabaseConstants.TABLES.REPOSITORY,
        timestamps: false,
      }
    );
  };
}

export default Repository;
