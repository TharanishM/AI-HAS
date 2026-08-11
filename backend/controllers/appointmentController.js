import { Op } from 'sequelize';
import sequelize from '../config/db.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Notification from '../models/Notification.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Hospital from '../models/Hospital.js';
import Bill from '../models/Bill.js';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

const createAlert = async (req, userId, title, message, type) => {
  try {
    const existing = await Notification.findOne({
      where: { userId, title, message, type }
    });
    if (existing) return;

    const notification = await Notification.create({ userId, title, message, type });
    if (req && req.app) {
      const io = req.app.get('io');
      if (io) {
        io.to(userId).emit('notification', {
          id: notification.id,
          title,
          message,
          type,
          isRead: false,
          createdAt: notification.createdAt
        });
      }
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const bookAppointment = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { doctorId, hospitalId, date, timeSlot, reason } = req.body;
    const patientId = req.user.id;

    // Validate that the appointment date is not in the past
    const todayDateOnly = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    if (date < todayDateOnly) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Please select today or a future appointment date.' });
    }

    // Validate that the timeslot is not in the past if scheduled for today
    if (date === todayDateOnly) {
      const match = timeSlot.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      if (match) {
        let [_, hours, minutes, ampm] = match;
        hours = parseInt(hours);
        minutes = parseInt(minutes);
        if (ampm.toUpperCase() === 'PM' && hours !== 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        
        const slotTime = new Date();
        slotTime.setHours(hours, minutes, 0, 0);
        if (slotTime <= new Date()) {
          await t.rollback();
          return res.status(400).json({ success: false, message: 'The selected time slot has already passed.' });
        }
      }
    }

    const doctorUser = await User.findByPk(doctorId, { transaction: t });
    if (!doctorUser || doctorUser.role !== 'Doctor') {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const doctorProfile = await Doctor.findOne({ where: { userId: doctorId }, transaction: t });
    const finalHospitalId = hospitalId || (doctorProfile ? doctorProfile.hospitalId : null);

    const bookingConflict = await Appointment.findOne({
      where: {
        doctorId,
        date,
        timeSlot,
        status: { [Op.in]: ['Pending', 'Accepted', 'Rescheduled'] }
      },
      lock: true,
      transaction: t
    });

    if (bookingConflict) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'This timeslot has already been booked' });
    }

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await Appointment.count({
      where: {
        appointmentNumber: {
          [Op.like]: `APT-${todayStr}-%`
        }
      },
      transaction: t
    });
    const appointmentNumber = `APT-${todayStr}-${String(countToday + 1).padStart(4, '0')}`;

    const countDoctorAppointments = await Appointment.count({
      where: {
        doctorId,
        date
      },
      transaction: t
    });
    const tokenNumber = String(countDoctorAppointments + 1);

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      hospitalId: finalHospitalId,
      appointmentNumber,
      tokenNumber,
      date,
      timeSlot,
      reason,
      status: 'Pending',
    }, { transaction: t });

    // Generate Invoice/Bill
    const billingDate = new Date().toISOString().slice(0, 10);
    const invoiceNumber = `INV-${todayStr}-${String(countToday + 1).padStart(4, '0')}`;
    const amount = doctorProfile ? doctorProfile.fees : 500;

    await Bill.create({
      appointmentId: appointment.id,
      patientId,
      doctorId,
      invoiceNumber,
      amount,
      status: 'Unpaid',
      paymentMethod: 'Pending',
      billingDate,
    }, { transaction: t });

    await t.commit();

    const populatedAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        { model: User, as: 'doctor', attributes: ['name'] },
        { model: Hospital, as: 'hospital', attributes: ['name', 'address', 'city', 'state', 'pinCode', 'latitude', 'longitude'] }
      ]
    });

    await createAlert(
      req,
      patientId,
      'Appointment Booked',
      `Your appointment request with Dr. ${doctorUser.name} on ${date} at ${timeSlot} has been submitted. Token: ${tokenNumber}`,
      'Booking'
    );

    await createAlert(
      req,
      doctorId,
      'New Appointment Request',
      `You have a new appointment request from Patient ${req.user.name} for ${date} at ${timeSlot}. Token: ${tokenNumber}`,
      'Booking'
    );

    const admins = await User.findAll({ where: { role: 'Admin' } });
    for (const admin of admins) {
      await createAlert(
        req,
        admin.id,
        'New Appointment Booked',
        `A new appointment (${appointmentNumber}) has been booked by Patient ${req.user.name} with Dr. ${doctorUser.name} on ${date} at ${timeSlot}. Token: ${tokenNumber}`,
        'Booking'
      );
    }

    res.status(201).json({ success: true, appointment: populatedAppointment });
  } catch (error) {
    if (t) await t.rollback();
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    let appointments;

    const includeConfig = [
      {
        model: User,
        as: 'doctor',
        attributes: ['id', 'name', 'email', 'phone', 'avatar'],
        include: [
          {
            model: Doctor,
            as: 'doctor',
            attributes: ['specialization', 'fees'],
            include: [{ model: Hospital, as: 'hospital' }]
          }
        ]
      },
      {
        model: User,
        as: 'patient',
        attributes: ['id', 'name', 'email', 'phone', 'gender']
      },
      {
        model: Hospital,
        as: 'hospital'
      }
    ];

    if (req.user.role === 'Patient') {
      appointments = await Appointment.findAll({
        where: { patientId: req.user.id },
        include: includeConfig,
        order: [['date', 'ASC'], ['timeSlot', 'ASC']]
      });
    } else if (req.user.role === 'Doctor') {
      appointments = await Appointment.findAll({
        where: { doctorId: req.user.id },
        include: includeConfig,
        order: [['date', 'ASC'], ['timeSlot', 'ASC']]
      });
    } else if (req.user.role === 'Admin') {
      appointments = await Appointment.findAll({
        include: includeConfig,
        order: [['date', 'DESC']]
      });
    }

    const formatted = appointments.map(app => {
      const plain = app.toJSON();
      return {
        ...plain,
        _id: plain.id,
        doctorId: plain.doctor ? { ...plain.doctor, _id: plain.doctor.id } : null,
        patientId: plain.patient ? { ...plain.patient, _id: plain.patient.id } : null,
      };
    });

    res.status(200).json({ success: true, count: formatted.length, appointments: formatted });
  } catch (error) {
    next(error);
  }
};

export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { date, timeSlot } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (
      req.user.role !== 'Admin' &&
      appointment.patientId !== req.user.id &&
      appointment.doctorId !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to reschedule this appointment' });
    }

    const conflict = await Appointment.findOne({
      where: {
        id: { [Op.ne]: req.params.id },
        doctorId: appointment.doctorId,
        date,
        timeSlot,
        status: { [Op.in]: ['Pending', 'Accepted', 'Rescheduled'] }
      }
    });

    if (conflict) {
      return res.status(400).json({ success: false, message: 'The requested timeslot is already booked' });
    }

    const oldDate = appointment.date;
    const oldSlot = appointment.timeSlot;

    appointment.date = date;
    appointment.timeSlot = timeSlot;
    appointment.status = 'Rescheduled';
    await appointment.save();

    const alertMsg = `Appointment rescheduled from ${oldDate} at ${oldSlot} to ${date} at ${timeSlot}.`;
    
    await createAlert(req, appointment.patientId, 'Appointment Rescheduled', alertMsg, 'Booking');
    await createAlert(req, appointment.doctorId, 'Appointment Rescheduled', alertMsg, 'Booking');

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason, notes } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (status === 'Accepted' || status === 'Rejected' || status === 'Completed') {
      if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Only doctors or admins can update status to ' + status });
      }
      if (req.user.role === 'Doctor' && appointment.doctorId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'You can only manage your own appointments' });
      }
    }

    if (status === 'Cancelled') {
      if (
        req.user.role !== 'Admin' &&
        appointment.patientId !== req.user.id &&
        appointment.doctorId !== req.user.id
      ) {
        return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
      }
    }

    appointment.status = status;
    if (cancellationReason !== undefined) appointment.cancellationReason = cancellationReason;
    if (notes !== undefined) appointment.notes = notes;
    await appointment.save();

    const msg = `Appointment on ${appointment.date} at ${appointment.timeSlot} is now ${status}.`;
    await createAlert(req, appointment.patientId, `Appointment ${status}`, msg, status === 'Cancelled' ? 'Cancellation' : 'Info');
    await createAlert(req, appointment.doctorId, `Appointment ${status}`, msg, status === 'Cancelled' ? 'Cancellation' : 'Info');

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

export const createMedicalRecord = async (req, res, next) => {
  try {
    const { diagnosis, prescription, labTests, notes } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (req.user.role !== 'Doctor' || appointment.doctorId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the assigned doctor can file medical records' });
    }

    appointment.status = 'Completed';
    await appointment.save();

    const record = await MedicalRecord.create({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentId: appointment.id,
      diagnosis,
      prescription,
      labTests,
      notes,
    });

    await createAlert(
      req,
      appointment.patientId,
      'New Medical Prescription Filed',
      `Dr. ${req.user.name} has submitted a prescription/medical record for your visit. Check dashboard to view.`,
      'Info'
    );

    res.status(201).json({ success: true, record });
  } catch (error) {
    next(error);
  }
};

export const getMedicalRecords = async (req, res, next) => {
  try {
    let records;

    const includeConfig = [
      {
        model: User,
        as: 'doctor',
        attributes: ['id', 'name', 'email', 'phone', 'avatar']
      },
      {
        model: User,
        as: 'patient',
        attributes: ['id', 'name', 'email', 'phone', 'gender']
      },
      {
        model: Appointment,
        as: 'appointment'
      }
    ];

    if (req.user.role === 'Patient') {
      records = await MedicalRecord.findAll({
        where: { patientId: req.user.id },
        include: includeConfig,
        order: [['createdAt', 'DESC']]
      });
    } else if (req.user.role === 'Doctor') {
      records = await MedicalRecord.findAll({
        where: { doctorId: req.user.id },
        include: includeConfig,
        order: [['createdAt', 'DESC']]
      });
    } else if (req.user.role === 'Admin') {
      records = await MedicalRecord.findAll({
        include: includeConfig,
        order: [['createdAt', 'DESC']]
      });
    }

    const formatted = records.map(rec => {
      const plain = rec.toJSON();
      let parsedPrescription = plain.prescription;
      if (typeof parsedPrescription === 'string') {
        try {
          parsedPrescription = JSON.parse(parsedPrescription);
        } catch (e) {
          parsedPrescription = [];
        }
      }
      let parsedLabTests = plain.labTests;
      if (typeof parsedLabTests === 'string') {
        try {
          parsedLabTests = JSON.parse(parsedLabTests);
        } catch (e) {
          parsedLabTests = [];
        }
      }
      return {
        ...plain,
        _id: plain.id,
        prescription: parsedPrescription || [],
        labTests: parsedLabTests || [],
        doctorId: plain.doctor ? { ...plain.doctor, _id: plain.doctor.id } : null,
        patientId: plain.patient ? { ...plain.patient, _id: plain.patient.id } : null,
        appointmentId: plain.appointment ? { ...plain.appointment, _id: plain.appointment.id } : null
      };
    });

    res.status(200).json({ success: true, count: formatted.length, records: formatted });
  } catch (error) {
    next(error);
  }
};

export const downloadAppointmentReceipt = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: User, as: 'patient', attributes: ['name', 'phone', 'email'] },
        { model: User, as: 'doctor', attributes: ['name'] },
        { model: Hospital, as: 'hospital', attributes: ['name', 'address', 'phone'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt_${appointment.appointmentNumber}.pdf`);
    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Hospital Appointment Receipt', { align: 'center' });
    doc.moveDown();

    // Details
    doc.fontSize(12).text(`Appointment Number: ${appointment.appointmentNumber}`);
    doc.text(`Token Number: ${appointment.tokenNumber}`);
    doc.text(`Patient Name: ${appointment.patient ? appointment.patient.name : 'N/A'}`);
    doc.text(`Doctor Name: Dr. ${appointment.doctor ? appointment.doctor.name : 'N/A'}`);
    doc.text(`Hospital: ${appointment.hospital ? appointment.hospital.name : 'N/A'}`);
    doc.text(`Date: ${appointment.date}`);
    doc.text(`Time Slot: ${appointment.timeSlot}`);
    doc.text(`Status: ${appointment.status}`);
    doc.moveDown();

    // QR Code
    const qrData = JSON.stringify({
      appointmentNumber: appointment.appointmentNumber,
      tokenNumber: appointment.tokenNumber,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      status: appointment.status
    });

    const qrCodeUrl = await QRCode.toDataURL(qrData);
    doc.text('Scan to Verify Receipt:', { align: 'left' });
    doc.image(qrCodeUrl, { fit: [150, 150], align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};

export const downloadPrescriptionPDF = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id, {
      include: [
        { model: User, as: 'patient', attributes: ['name', 'gender'] },
        { model: User, as: 'doctor', attributes: ['name'] },
        { model: Appointment, as: 'appointment', attributes: ['appointmentNumber'] }
      ]
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical Record not found' });
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription_${record.id}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('Medical Prescription', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Patient Name: ${record.patient ? record.patient.name : 'N/A'}`);
    doc.text(`Doctor Name: Dr. ${record.doctor ? record.doctor.name : 'N/A'}`);
    doc.text(`Appointment Number: ${record.appointment ? record.appointment.appointmentNumber : 'N/A'}`);
    doc.text(`Diagnosis: ${record.diagnosis}`);
    doc.moveDown();

    doc.text('Prescription Details:', { underline: true });
    
    let parsedPrescription = record.prescription;
    if (typeof parsedPrescription === 'string') {
      try {
        parsedPrescription = JSON.parse(parsedPrescription);
      } catch (e) {
        parsedPrescription = [];
      }
    }
    
    if (Array.isArray(parsedPrescription) && parsedPrescription.length > 0) {
      parsedPrescription.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.medication || item.name} - ${item.dosage || ''} (${item.frequency || ''})`);
      });
    } else {
      doc.text(typeof record.prescription === 'string' ? record.prescription : 'No medications listed.');
    }

    doc.moveDown();
    if (record.notes) {
      doc.text(`Notes: ${record.notes}`);
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};
