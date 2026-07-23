import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Hospital from './Hospital.js';

const Appointment = sequelize.define('Appointment', {
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
  hospitalId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Hospital,
      key: 'id',
    },
  },
  appointmentNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  tokenNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  timeSlot: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected', 'Cancelled', 'Completed', 'Rescheduled'),
    defaultValue: 'Pending',
  },
  cancellationReason: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
});

Appointment.belongsTo(User, { as: 'patient', foreignKey: 'patientId', onDelete: 'CASCADE' });
Appointment.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId', onDelete: 'CASCADE' });
User.hasMany(Appointment, { as: 'patientAppointments', foreignKey: 'patientId' });
User.hasMany(Appointment, { as: 'doctorAppointments', foreignKey: 'doctorId' });

Appointment.belongsTo(Hospital, { as: 'hospital', foreignKey: 'hospitalId', onDelete: 'CASCADE' });
Hospital.hasMany(Appointment, { as: 'appointments', foreignKey: 'hospitalId' });

export default Appointment;
