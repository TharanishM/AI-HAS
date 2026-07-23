import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: 'Activity',
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Pending', 'Approved', 'Rejected'),
    defaultValue: 'Approved',
  },
});

export default Department;
