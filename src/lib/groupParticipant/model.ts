import Sequelize from 'sequelize';

import { DatabaseConstants } from '../../consts';

interface GroupParticipantAttributes {
  readonly id?: number;
  readonly groupId?: number;
  readonly assignmentId?: number;
  readonly userRoleId?: number;
  readonly active?: boolean;
}

class GroupParticipant
  extends Sequelize.Model<GroupParticipantAttributes>
  implements GroupParticipantAttributes
{
  readonly id!: number;
  readonly groupId!: number;
  readonly assignmentId!: number;
  readonly userRoleId!: number;
  readonly active!: boolean;

  static initialize = (db: Sequelize.Sequelize) => {
    return GroupParticipant.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        groupId: {
          type: Sequelize.INTEGER,
          field: 'group_id',
          allowNull: false,
        },
        assignmentId: {
          type: Sequelize.INTEGER,
          field: 'assignment_id',
          allowNull: false,
        },
        userRoleId: {
          type: Sequelize.INTEGER,
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

  static associate = (models: any) => {
    const { AssignmentModel, GroupModel, UserRoleModel } = models;

    GroupParticipant.belongsTo(AssignmentModel, { foreignKey: 'assignment_id' });
    GroupParticipant.belongsTo(GroupModel, { foreignKey: 'group_id' });
    GroupParticipant.belongsTo(UserRoleModel, { foreignKey: 'user_role_id' });
  };
}

export default GroupParticipant;
