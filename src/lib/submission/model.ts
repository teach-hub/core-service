import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

export interface SubmissionAttributes {
  readonly id?: number;
  readonly submiteeId?: number;
  readonly assignmentId?: number;
  readonly description?: string | null;
  readonly pullRequestUrl?: string;
  readonly createdAt?: Date | null;
  readonly updatedAt?: Date | null;
}

class SubmissionModel
  extends Sequelize.Model<SubmissionAttributes>
  implements SubmissionAttributes
{
  readonly id!: number;
  readonly submiteeId!: number;
  readonly assignmentId!: number;
  readonly description!: string | null;
  readonly pullRequestUrl!: string;
  readonly createdAt!: Date | null;
  readonly updatedAt!: Date | null;

  static initialize = (db: Sequelize.Sequelize) => {
    return SubmissionModel.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        submiteeId: {
          field: 'submitee_id',
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        assignmentId: {
          field: 'assignment_id',
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        description: {
          type: Sequelize.STRING,
        },
        pullRequestUrl: {
          type: Sequelize.STRING,
          field: 'pull_request_url',
          allowNull: false,
        },
        createdAt: {
          field: 'created_at',
          type: Sequelize.DATE,
        },
        updatedAt: {
          field: 'updated_at',
          type: Sequelize.DATE,
        },
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.SUBMISSION,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  };
}

export default SubmissionModel;
