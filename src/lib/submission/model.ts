import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

interface SubmissionAttributes {
  readonly id?: number;
  readonly userId?: number;
  readonly assignmentId?: number;
  readonly description?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

class SubmissionModel
  extends Sequelize.Model<SubmissionAttributes>
  implements SubmissionAttributes
{
  readonly id!: number;
  readonly userId!: number;
  readonly assignmentId!: number;
  readonly description!: string;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;

  static initialize = (db: Sequelize.Sequelize) => {
    return SubmissionModel.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          field: 'user_id',
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
        createdAt: {
          field: 'created_at',
          type: Sequelize.DATE
        },
        updatedAt: {
          field: 'created_at',
          type: Sequelize.DATE
        }
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
