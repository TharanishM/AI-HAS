import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Appointment from './Appointment.js';

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Appointment,
      key: 'id',
    },
  },
  diagnosis: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prescription: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  labTests: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

MedicalRecord.belongsTo(User, { as: 'patient', foreignKey: 'patientId', onDelete: 'CASCADE' });
MedicalRecord.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId', onDelete: 'CASCADE' });
MedicalRecord.belongsTo(Appointment, { as: 'appointment', foreignKey: 'appointmentId', onDelete: 'CASCADE' });

User.hasMany(MedicalRecord, { as: 'patientMedicalRecords', foreignKey: 'patientId' });
User.hasMany(MedicalRecord, { as: 'doctorMedicalRecords', foreignKey: 'doctorId' });
Appointment.hasOne(MedicalRecord, { as: 'medicalRecord', foreignKey: 'appointmentId' });

export default MedicalRecord;
