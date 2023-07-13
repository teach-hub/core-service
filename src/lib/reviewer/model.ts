import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

interface ReviewerAttributes {
  readonly id?: number;
  readonly assignmentId?: number;
  readonly reviewerUserId?: number;
  readonly revieweeUserId?: number;
}

class ReviewerModel
  extends Sequelize.Model<ReviewerAttributes>
  implements ReviewerAttributes
{
  readonly id!: number;
  readonly reviewerUserId!: number;
  readonly assignmentId!: number;
  readonly revieweeUserId!: number;

  static initialize = (db: Sequelize.Sequelize) => {
    return ReviewerModel.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        reviewerUserId: {
          type: Sequelize.NUMBER,
          field: 'reviewer_user_id',
          allowNull: false,
        },
        assignmentId: {
          type: Sequelize.NUMBER,
          field: 'assignment_id',
          allowNull: false,
        },
        revieweeUserId: {
          type: Sequelize.NUMBER,
          field: 'reviewee_user_id',
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

export default ReviewerModel;
