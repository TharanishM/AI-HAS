import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Notification = sequelize.define('Notification', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('Booking', 'Cancellation', 'Reminder', 'Info'),
    defaultValue: 'Info',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

Notification.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

export default Notification;
