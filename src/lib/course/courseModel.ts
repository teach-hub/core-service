import {
  BOOLEAN,
  CreationOptional,
  ENUM,
  InferAttributes,
  InferCreationAttributes,
  INTEGER,
  Model,
  Sequelize,
  TEXT,
} from 'sequelize';

import { DatabaseConstants } from '../../consts';

import type { Optional } from 'src/types';

export type CoursePeriod = '1' | '2';

class CourseModel extends Model<
  InferAttributes<CourseModel>,
  InferCreationAttributes<CourseModel>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: Optional<string>;
  declare githubOrganization: Optional<string>;
  declare subjectId: number;
  declare period: CoursePeriod;
  declare year: number;
  declare active: boolean;

  static initialize = (db: Sequelize) => {
    return CourseModel.init(
      {
        id: {
          type: INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: TEXT,
          allowNull: false,
        },
        description: {
          type: TEXT,
          allowNull: true,
        },
        githubOrganization: {
          type: TEXT,
          field: 'github_organization',
        },
        subjectId: {
          type: INTEGER,
          field: 'subject_id',
          allowNull: false,
        },
        period: {
          type: ENUM('1', '2'),
          allowNull: false,
        },
        year: {
          type: INTEGER,
          allowNull: false,
        },
        active: {
          type: BOOLEAN,
          allowNull: false,
        },
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.COURSE,
        timestamps: false,
      }
    );
  };

  // FIXME. No copiar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate = (models: any) => {
    const { SubjectModel } = models;

    CourseModel.belongsTo(SubjectModel, { foreignKey: 'subject_id' });
  };
}

export default CourseModel;
