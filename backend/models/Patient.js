import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Patient = sequelize.define('Patient', {
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
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  bloodGroup: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  allergies: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  medicalHistory: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
});

User.hasOne(Patient, { foreignKey: 'userId', as: 'patient', onDelete: 'CASCADE' });
Patient.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });

export default Patient;
