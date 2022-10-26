import Sequelize from 'sequelize';

import db from './db';

class Subject extends Sequelize.Model {
  readonly name!: String;
  readonly code!: String;
  readonly active!: Boolean
}

Subject.init(
  {
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

export default Subject;
