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

    const getIndiaTime = () => {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      });
      const parts = formatter.formatToParts(new Date());
      const hours = parseInt(parts.find(p => p.type === 'hour').value, 10);
      const minutes = parseInt(parts.find(p => p.type === 'minute').value, 10);
      return { hours, minutes };
    };

    const parseSlotTo24h = (slotStr) => {
      const match12 = slotStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      if (match12) {
        let [_, hours, minutes, ampm] = match12;
        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);
        if (ampm.toUpperCase() === 'PM' && hours !== 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        return { hours, minutes };
      }
      const match24 = slotStr.match(/^(\d+):(\d+)$/);
      if (match24) {
        const hours = parseInt(match24[1], 10);
        const minutes = parseInt(match24[2], 10);
        return { hours, minutes };
      }
      return null;
    };

    const isSlotInPast = (slotStr) => {
      const slotTime = parseSlotTo24h(slotStr);
      if (!slotTime) return false;
      const nowIndia = getIndiaTime();
      if (slotTime.hours < nowIndia.hours) return true;
      if (slotTime.hours === nowIndia.hours && slotTime.minutes <= nowIndia.minutes) return true;
      return false;
    };

    // Validate that the appointment date is not in the past (using India timezone)
    const todayDateOnly = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
    if (date < todayDateOnly) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Appointment date and time must be in the future.' });
    }

    // Validate that the timeslot is not in the past if scheduled for today
    if (date === todayDateOnly && isSlotInPast(timeSlot)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Appointment date and time must be in the future.' });
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

import Department from '../models/Department.js';

export const downloadAppointmentReceipt = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: User, as: 'patient', attributes: ['id', 'name', 'phone', 'email'] },
        { 
          model: User, 
          as: 'doctor', 
          attributes: ['name'],
          include: [
            {
              model: Doctor,
              as: 'doctor',
              attributes: ['specialization'],
              include: [
                {
                  model: Department,
                  as: 'department',
                  attributes: ['name']
                }
              ]
            }
          ]
        },
        { model: Hospital, as: 'hospital', attributes: ['name', 'address', 'phone'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=AI-HAS_Appointment_${appointment.appointmentNumber}.pdf`);
    doc.pipe(res);

    // Draw header box
    doc.rect(50, 40, 495, 60).fill('#0e7ff0');
    
    // Header Text
    doc.fillColor('#ffffff');
    doc.fontSize(22).font('Helvetica-Bold').text('AI-HAS', 65, 52);
    doc.fontSize(10).font('Helvetica').text('Healthcare Appointment System', 65, 80);
    doc.fontSize(10).font('Helvetica-Oblique').text('Care, Connected', 450, 80, { align: 'right', width: 80 });

    // Summary Box
    doc.rect(50, 115, 495, 55).fill('#f8fafc');
    doc.strokeColor('#e2e8f0').lineWidth(1).rect(50, 115, 495, 55).stroke();

    // Summary content
    doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold').text('APPOINTMENT ID', 65, 125);
    doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text(appointment.appointmentNumber, 65, 137);

    doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold').text('TOKEN NUMBER', 220, 125);
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text(appointment.tokenNumber, 220, 135);

    doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold').text('STATUS', 380, 125);
    
    const status = appointment.status || 'Pending';
    let statusColor = '#eab308'; // yellow
    if (status === 'Accepted' || status === 'Confirmed' || status === 'Completed') statusColor = '#10b981'; // green
    if (status === 'Rejected' || status === 'Cancelled') statusColor = '#ef4444'; // red
    doc.fillColor(statusColor).fontSize(11).font('Helvetica-Bold').text(`● ${status}`, 380, 137);

    // Details Grid Layout
    let y = 190;
    
    // Section Title
    doc.fillColor('#0e7ff0').fontSize(12).font('Helvetica-Bold').text('APPOINTMENT DETAILS', 50, y);
    doc.moveTo(50, y + 16).lineTo(545, y + 16).strokeColor('#e2e8f0').stroke();
    
    y += 25;
    
    // Patient Information Section
    doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold').text('PATIENT INFORMATION', 50, y);
    doc.fillColor('#64748b').fontSize(9).font('Helvetica').text('Name:', 50, y + 15);
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(appointment.patient ? appointment.patient.name : 'N/A', 120, y + 15);
    
    doc.fillColor('#64748b').font('Helvetica').text('Patient ID:', 50, y + 30);
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(appointment.patient ? appointment.patient.id : 'N/A', 120, y + 30);
    
    doc.fillColor('#64748b').font('Helvetica').text('Phone:', 50, y + 45);
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(appointment.patient ? appointment.patient.phone : 'N/A', 120, y + 45);
    
    doc.fillColor('#64748b').font('Helvetica').text('Email:', 50, y + 60);
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(appointment.patient ? appointment.patient.email : 'N/A', 120, y + 60);

    // Right Column: Hospital Information
    doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold').text('HOSPITAL INFORMATION', 300, y);
    doc.fillColor('#64748b').fontSize(9).font('Helvetica').text('Hospital:', 300, y + 15);
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(appointment.hospital ? appointment.hospital.name : 'N/A', 360, y + 15, { width: 180 });
    
    doc.fillColor('#64748b').font('Helvetica').text('Address:', 300, y + 35);
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(appointment.hospital ? appointment.hospital.address : 'N/A', 360, y + 35, { width: 180 });
    
    doc.fillColor('#64748b').font('Helvetica').text('Phone:', 300, y + 60);
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(appointment.hospital ? appointment.hospital.phone : 'N/A', 360, y + 60);

    y += 85;

    // Doctor Info
    doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold').text('DOCTOR INFORMATION', 50, y);
    doc.fillColor('#64748b').fontSize(9).font('Helvetica').text('Doctor Name:', 50, y + 15);
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(appointment.doctor ? `Dr. ${appointment.doctor.name}` : 'N/A', 120, y + 15);
    
    const specialization = appointment.doctor && appointment.doctor.doctor ? appointment.doctor.doctor.specialization : 'N/A';
    doc.fillColor('#64748b').font('Helvetica').text('Specialization:', 50, y + 30);
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(specialization, 120, y + 30);

    const departmentName = appointment.doctor && appointment.doctor.doctor && appointment.doctor.doctor.department ? appointment.doctor.doctor.department.name : 'N/A';
    doc.fillColor('#64748b').font('Helvetica').text('Department:', 50, y + 45);
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(departmentName, 120, y + 45);

    // Right Column: Schedule & Location Details
    doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold').text('SCHEDULE DETAILS', 300, y);
    doc.fillColor('#64748b').fontSize(9).font('Helvetica').text('Date:', 300, y + 15);
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(appointment.date, 360, y + 15);
    
    doc.fillColor('#64748b').font('Helvetica').text('Time Slot:', 300, y + 30);
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(appointment.timeSlot, 360, y + 30);

    const distanceVal = req.query.distance ? `${req.query.distance} km` : 'Not available';
    doc.fillColor('#64748b').font('Helvetica').text('Distance:', 300, y + 45);
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(distanceVal, 360, y + 45);

    y += 75;

    // Reason for Visit
    doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold').text('REASON FOR VISIT', 50, y);
    doc.fillColor('#334155').fontSize(9).font('Helvetica').text(appointment.reason || 'No clinical reason provided.', 50, y + 15, { width: 495 });

    y += 50;

    // Important Instructions
    doc.fillColor('#e01e5a').fontSize(10).font('Helvetica-Bold').text('IMPORTANT INSTRUCTIONS', 50, y);
    doc.moveTo(50, y + 16).lineTo(545, y + 16).strokeColor('#e2e8f0').stroke();
    
    y += 25;
    doc.fillColor('#475569').fontSize(8.5).font('Helvetica');
    doc.text('• Please arrive 10–15 minutes before your scheduled appointment time.', 50, y);
    doc.text('• Carry a valid government-issued photo identity card when visiting the hospital.', 50, y + 15);
    doc.text('• Bring previous medical reports, prescriptions, and test results if applicable.', 50, y + 30);
    doc.text('• Contact the hospital front desk directly if you need to cancel or reschedule.', 50, y + 45);

    // Scan & Verification QR Code Area
    const qrData = JSON.stringify({
      appointmentNumber: appointment.appointmentNumber,
      tokenNumber: appointment.tokenNumber,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      status: appointment.status
    });
    const qrCodeUrl = await QRCode.toDataURL(qrData);
    doc.image(qrCodeUrl, 420, y, { fit: [65, 65] });
    doc.fillColor('#64748b').fontSize(7).text('Scan to Verify', 420, y + 70, { width: 65, align: 'center' });

    // Footer
    const localGenTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    doc.moveTo(50, 750).lineTo(545, 750).strokeColor('#cbd5e1').stroke();
    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text('AI-HAS | Care, Connected', 50, 760);
    doc.text(`Generated: ${localGenTime} (IST)`, 400, 760, { align: 'right', width: 145 });

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
