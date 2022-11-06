import Sequelize from 'sequelize';

import db from '../db';

class SubjectModel extends Sequelize.Model {
  readonly id!: Number;
  readonly name!: String;
  readonly code!: String;
  readonly active!: Boolean
}

SubjectModel.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: Sequelize.TEXT,
    code: Sequelize.TEXT,
    active: Sequelize.BOOLEAN
  },
  {
    sequelize: db,
    schema: 'teachhub',
    tableName: 'subjects',
    timestamps: false,
  }
);

export default SubjectModel;
