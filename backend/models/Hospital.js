import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Hospital = sequelize.define('Hospital', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  logo: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  banner: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pinCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  emergencyContact: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  openingHours: {
    type: DataTypes.STRING,
    defaultValue: '09:00 AM - 09:00 PM',
  },
  departments: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 5.0,
  },
  latitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Approved',
  },
  gallery: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  facilities: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  liveBedAvailability: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

export default Hospital;
