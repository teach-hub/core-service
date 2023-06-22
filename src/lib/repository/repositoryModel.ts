import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

interface RepositoryAttributes {
  readonly id?: number;
  readonly courseId?: number;
  readonly userId?: number;
  readonly githubId?: number;
  readonly name?: string;
  readonly active?: boolean;
}

class RepositoryModel
  extends Sequelize.Model<RepositoryAttributes>
  implements RepositoryAttributes
{
  readonly id!: number;
  readonly courseId!: number;
  readonly userId!: number;
  readonly githubId!: number;
  readonly name!: string;
  readonly active!: boolean;

  static initialize = (db: Sequelize.Sequelize) => {
    return RepositoryModel.init(
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
        userId: {
          type: Sequelize.INTEGER,
          field: 'user_id',
          allowNull: false,
        },
        githubId: {
          field: 'github_id',
          type: Sequelize.TEXT,
          allowNull: false,
        },
        name: {
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
        tableName: DatabaseConstants.TABLES.REPOSITORY,
        timestamps: false,
      }
    );
  };
}

export default RepositoryModel;
