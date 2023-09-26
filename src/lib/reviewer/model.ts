import {
  INTEGER,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

import { DatabaseConstants } from '../../consts';

class Reviewer extends Model<InferAttributes<Reviewer>, InferCreationAttributes<Reviewer>> {
  declare id: CreationOptional<number>;
  declare reviewerUserId: number;
  declare assignmentId: number;
  declare revieweeId: number;

  static initialize = (db: Sequelize) => {
    return Reviewer.init(
      {
        id: {
          type: INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        reviewerUserId: {
          type: INTEGER,
          field: 'reviewer_user_id',
          allowNull: false,
        },
        assignmentId: {
          type: INTEGER,
          field: 'assignment_id',
          allowNull: false,
        },
        revieweeId: {
          type: INTEGER,
          field: 'reviewee_id',
          allowNull: false,
        },
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.REVIEWER,
        timestamps: false,
      }
    );
  };
}

export default Reviewer;
