import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

interface ReviewAttributes {
  readonly id?: number;
  readonly submissionId?: number;
  readonly reviewerId?: number;
  readonly grade?: number;
  readonly revisionRequested?: boolean;
  readonly createdAt?: Date | null;
  readonly updatedAt?: Date | null;
}

class Review extends Sequelize.Model<ReviewAttributes> implements ReviewAttributes {
  readonly id!: number;
  readonly submissionId!: number;
  readonly reviewerId!: number;
  readonly grade!: number;
  readonly revisionRequested!: boolean;
  readonly createdAt?: Date | null;
  readonly updatedAt?: Date | null;

  static initialize = (db: Sequelize.Sequelize) => {
    return Review.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        submissionId: {
          type: Sequelize.INTEGER,
          field: 'submission_id',
          allowNull: false,
        },
        reviewerId: {
          type: Sequelize.INTEGER,
          field: 'reviewer_id',
          allowNull: false,
        },
        grade: {
          type: Sequelize.INTEGER,
          field: 'grade',
        },
        revisionRequested: {
          type: Sequelize.BOOLEAN,
          field: 'revision_requested',
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
        tableName: DatabaseConstants.TABLES.REVIEWE,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  };
}

export default Review;
