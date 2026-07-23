import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Appointment from './Appointment.js';

const Bill = sequelize.define('Bill', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Appointment,
      key: 'id',
    },
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
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('Paid', 'Unpaid', 'Refunded'),
    defaultValue: 'Unpaid',
  },
  paymentMethod: {
    type: DataTypes.ENUM('Cash', 'Card', 'UPI', 'NetBanking', 'Pending'),
    defaultValue: 'Pending',
  },
  billingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  razorpayOrderId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  razorpayPaymentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  razorpaySignature: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Bill.belongsTo(User, { as: 'patient', foreignKey: 'patientId', onDelete: 'CASCADE' });
Bill.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId', onDelete: 'CASCADE' });
Bill.belongsTo(Appointment, { as: 'appointment', foreignKey: 'appointmentId', onDelete: 'SET NULL' });

User.hasMany(Bill, { as: 'patientBills', foreignKey: 'patientId' });
User.hasMany(Bill, { as: 'doctorBills', foreignKey: 'doctorId' });
Appointment.hasOne(Bill, { as: 'bill', foreignKey: 'appointmentId' });

export default Bill;
