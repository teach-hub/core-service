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
  declare readonly id: CreationOptional<number>;
  declare readonly groupId: number;
  declare readonly userRoleId: number;
  declare readonly active: boolean;

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
    const { GroupModel, UserRoleModel } = models;

    GroupParticipant.belongsTo(GroupModel, { foreignKey: 'group_id' });
    GroupParticipant.belongsTo(UserRoleModel, { foreignKey: 'user_role_id' });
  };
}

export default GroupParticipant;
