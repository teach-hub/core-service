import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

interface SubjectAttributes {
  readonly id?: number;
  readonly name?: string;
  readonly code?: string;
  readonly active?: boolean;
}

class SubjectModel
  extends Sequelize.Model<SubjectAttributes>
  implements SubjectAttributes
{
  readonly id!: number;
  readonly name!: string;
  readonly code!: string;
  readonly active!: boolean;

  static initialize = (db: Sequelize.Sequelize) => {
    return SubjectModel.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: Sequelize.TEXT,
        code: Sequelize.TEXT,
        active: Sequelize.BOOLEAN,
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.SUBJECT,
        timestamps: false,
      }
    );
  };
}

export default SubjectModel;
