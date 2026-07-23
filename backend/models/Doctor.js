import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Department from './Department.js';
import Hospital from './Hospital.js';

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id',
    },
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Department,
      key: 'id',
    },
  },
  hospitalId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Hospital,
      key: 'id',
    },
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  fees: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 5.0,
  },
  qualifications: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  biography: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  availability: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  languages: {
    type: DataTypes.JSON,
    defaultValue: ['English', 'Tamil'],
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending',
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  reviews: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
});

User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctor', onDelete: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });

Department.hasMany(Doctor, { foreignKey: 'departmentId', as: 'doctors', onDelete: 'CASCADE' });
Doctor.belongsTo(Department, { foreignKey: 'departmentId', as: 'department', onDelete: 'CASCADE' });

Hospital.hasMany(Doctor, { foreignKey: 'hospitalId', as: 'doctors', onDelete: 'SET NULL' });
Doctor.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital', onDelete: 'SET NULL' });

export default Doctor;
