import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const AIHistory = sequelize.define('AIHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  symptomDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  predictedConditions: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  recommendedDepartment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  suggestedPrecautions: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

AIHistory.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
User.hasMany(AIHistory, { foreignKey: 'userId', as: 'aiHistories' });

export default AIHistory;
