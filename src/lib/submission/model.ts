import {
  INTEGER,
  DATE,
  TEXT,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

import { DatabaseConstants } from '../../consts';

class Submission extends Model<InferAttributes<Submission>, InferCreationAttributes<Submission>> {
  declare id: CreationOptional<number>;
  declare submitterId: number;
  declare assignmentId: number;
  declare pullRequestUrl: string;
  declare submittedAt: Date | null;
  declare submittedAgainAt: Date | null;

  static initialize = (db: Sequelize) => {
    return Submission.init(
      {
        id: {
          type: INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        submitterId: {
          field: 'submitter_id',
          type: INTEGER,
          allowNull: false,
        },
        assignmentId: {
          field: 'assignment_id',
          type: INTEGER,
          allowNull: false,
        },
        pullRequestUrl: {
          type: TEXT,
          field: 'pull_request_url',
          allowNull: false,
        },
        submittedAt: {
          field: 'created_at',
          type: DATE,
          allowNull: false,
        },
        submittedAgainAt: {
          field: 'updated_at',
          type: DATE,
        },
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.SUBMISSION,
        timestamps: false,
      }
    );
  };
}

export default Submission;
