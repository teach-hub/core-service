import {
  INTEGER,
  BOOLEAN,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

import { DatabaseConstants } from '../../consts';

class GroupParticipant extends Model<InferAttributes<GroupParticipant>, InferCreationAttributes<GroupParticipant>> {
  declare id: CreationOptional<number>;
  declare groupId: number;
  declare assignmentId: number;
  declare userRoleId: number;
  declare active: boolean;

  static initialize = (db: Sequelize) => {
    return GroupParticipant.init(
      {
        id: {
          type: INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        active: {
          type: BOOLEAN,
          allowNull: false,
        },
        groupId: {
          type: INTEGER,
          field: 'group_id',
          allowNull: false,
        },
        assignmentId: {
          type: INTEGER,
          field: 'assignment_id',
          allowNull: false,
        },
        userRoleId: {
          type: INTEGER,
          field: 'user_role_id',
          allowNull: false,
        },
      },
      {
        sequelize: db,
        schema: DatabaseConstants.SCHEMAS.TEACH_HUB,
        tableName: DatabaseConstants.TABLES.GROUP_PARTICIPANT,
        timestamps: false,
      }
    );
  };

  // FIXME. No copiar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate = (models: any) => {
    const { AssignmentModel, GroupModel, UserRoleModel } = models;

    GroupParticipant.belongsTo(AssignmentModel, { foreignKey: 'assignment_id' });
    GroupParticipant.belongsTo(GroupModel, { foreignKey: 'group_id' });
    GroupParticipant.belongsTo(UserRoleModel, { foreignKey: 'user_role_id' });
  };
}

export default GroupParticipant;
