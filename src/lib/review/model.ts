import { DatabaseConstants } from '../../consts';

import {
  INTEGER,
  DATE,
  BOOLEAN,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

import type { Optional } from 'src/types';

class Review extends Model<InferAttributes<Review>, InferCreationAttributes<Review>> {
  declare id: CreationOptional<number>;
  declare submissionId: number;
  declare reviewerId: number;
  declare grade: Optional<number>;
  declare revisionRequested: Optional<boolean>;
  declare reviewedAt: Date;
  declare reviewedAgainAt: Optional<Date>;

  static initialize = (db: Sequelize) => {
    return Review.init(
      {
        id: {
          type: INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        submissionId: {
          type: INTEGER,
          field: 'submission_id',
          allowNull: false,
        },
        reviewerId: {
          type: INTEGER,
          field: 'reviewer_id',
          allowNull: false,
        },
        grade: {
          type: INTEGER,
          field: 'grade',
        },
        revisionRequested: {
          type: BOOLEAN,
          field: 'revision_requested',
        },
        reviewedAt: {
          field: 'created_at',
          type: DATE,
          allowNull: false,
        },
        reviewedAgainAt: {
          field: 'updated_at',
          type: DATE,
        },
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.REVIEW,
        timestamps: false,
      }
    );
  };
}

export default Review;
