import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Department from '../models/Department.js';
import Hospital from '../models/Hospital.js';
import Bill from '../models/Bill.js';
import MedicalRecord from '../models/MedicalRecord.js';
import sequelize from '../config/db.js';
import { Op } from 'sequelize';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const doctorCount = await User.count({ where: { role: 'Doctor' } });
    const patientCount = await User.count({ where: { role: 'Patient' } });
    const hospitalCount = await Hospital.count({});
    const appointmentCount = await Appointment.count({});
    const departmentCount = await Department.count({});

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayAppointmentsCount = await Appointment.count({ where: { date: todayStr } });

    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
    const monthlyAppointmentsCount = await Appointment.count({
      where: {
        date: {
          [Op.gte]: firstDayOfMonth
        }
      }
    });

    const pendingCount = await Appointment.count({ where: { status: 'Pending' } });
    const acceptedCount = await Appointment.count({ where: { status: 'Accepted' } });
    const rejectedCount = await Appointment.count({ where: { status: 'Rejected' } });
    const cancelledCount = await Appointment.count({ where: { status: 'Cancelled' } });
    const completedCount = await Appointment.count({ where: { status: 'Completed' } });
    const rescheduledCount = await Appointment.count({ where: { status: 'Rescheduled' } });

    const hospitalBookings = await Appointment.findAll({
      attributes: ['hospitalId', [sequelize.fn('COUNT', sequelize.col('hospitalId')), 'count']],
      where: { hospitalId: { [Op.ne]: null } },
      group: ['hospitalId'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 1,
      include: [{ model: Hospital, as: 'hospital', attributes: ['name'] }]
    });
    const mostBookedHospital = hospitalBookings[0] ? hospitalBookings[0].hospital?.name : 'N/A';

    const doctorConsults = await Appointment.findAll({
      attributes: ['doctorId', [sequelize.fn('COUNT', sequelize.col('doctorId')), 'count']],
      group: ['doctorId'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 1,
      include: [{ model: User, as: 'doctor', attributes: ['name'] }]
    });
    const mostConsultedDoctor = doctorConsults[0] ? doctorConsults[0].doctor?.name : 'N/A';

    const recentAppointments = await Appointment.findAll({
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'name', 'email', 'avatar']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name', 'avatar'],
          include: [
            {
              model: Doctor,
              as: 'doctor',
              attributes: ['specialization'],
              include: [{ model: Hospital, as: 'hospital', attributes: ['name'] }]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    const formattedAppointments = recentAppointments.map(app => {
      const plain = app.toJSON();
      return {
        ...plain,
        _id: plain.id,
        patientId: plain.patient ? { ...plain.patient, _id: plain.patient.id } : null,
        doctorId: plain.doctor ? { ...plain.doctor, _id: plain.doctor.id, specialization: plain.doctor.doctor?.specialization || 'Physician' } : null,
      };
    });

    const departments = await Department.findAll({});
    const deptStats = [];
    for (const dept of departments) {
      const docNum = await Doctor.count({ where: { departmentId: dept.id } });
      deptStats.push({
        department: dept.name,
        doctors: docNum
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalDoctors: doctorCount,
        totalPatients: patientCount,
        totalHospitals: hospitalCount,
        totalAppointments: appointmentCount,
        totalDepartments: departmentCount,
        todayAppointments: todayAppointmentsCount,
        monthlyAppointments: monthlyAppointmentsCount,
        mostBookedHospital,
        mostConsultedDoctor,
        breakdown: {
          Pending: pendingCount,
          Accepted: acceptedCount,
          Rejected: rejectedCount,
          Cancelled: cancelledCount,
          Completed: completedCount,
          Rescheduled: rescheduledCount,
        },
        deptStats,
        recentAppointments: formattedAppointments
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'gender', 'avatar', 'createdAt']
        }
      ]
    });

    const formattedPatients = patients.map(pat => {
      const plain = pat.toJSON();
      return {
        ...plain,
        _id: plain.id,
        userId: plain.user ? { ...plain.user, _id: plain.user.id } : null
      };
    });

    res.status(200).json({ success: true, count: formattedPatients.length, patients: formattedPatients });
  } catch (error) {
    next(error);
  }
};

export const registerDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      specialization,
      departmentId,
      hospitalId,
      experience,
      fees,
      qualifications,
      biography,
      availability
    } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'Doctor',
      phone,
      gender,
    });

    const doctor = await Doctor.create({
      userId: user.id,
      specialization,
      departmentId,
      hospitalId: hospitalId || null,
      experience,
      fees,
      qualifications,
      biography,
      availability: availability || []
    });

    res.status(201).json({
      success: true,
      message: 'Doctor account and profile created successfully',
      user,
      doctor
    });
  } catch (error) {
    next(error);
  }
};

export const toggleDoctorStatus = async (req, res, next) => {
  try {
    let doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) {
      doctor = await Doctor.findOne({ where: { userId: req.params.id } });
    }

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    doctor.status = doctor.status === 'Active' ? 'Inactive' : 'Active';
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor status updated to ${doctor.status}`,
      doctor
    });
  } catch (error) {
    next(error);
  }
};

// --- Approval Management ---
export const getPendingApprovals = async (req, res, next) => {
  try {
    const doctors = await Doctor.findAll({
      where: { status: 'Pending' },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'gender', 'avatar'] },
        { model: Department, as: 'department', attributes: ['name'] },
        { model: Hospital, as: 'hospital', attributes: ['name'] }
      ]
    });

    const hospitals = await Hospital.findAll({ where: { status: 'Pending' } });
    const departments = await Department.findAll({ where: { status: 'Pending' } });

    res.status(200).json({
      success: true,
      pending: {
        doctors,
        hospitals,
        departments
      }
    });
  } catch (error) {
    next(error);
  }
};

export const approveDoctor = async (req, res, next) => {
  try {
    const { status } = req.body; // Approved or Rejected
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    doctor.status = status === 'Approved' ? 'Active' : 'Rejected';
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor status updated to ${doctor.status}`,
      doctor
    });
  } catch (error) {
    next(error);
  }
};

export const approveHospital = async (req, res, next) => {
  try {
    const { status } = req.body;
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    hospital.status = status;
    await hospital.save();

    res.status(200).json({
      success: true,
      message: `Hospital status updated to ${hospital.status}`,
      hospital
    });
  } catch (error) {
    next(error);
  }
};

export const approveDepartment = async (req, res, next) => {
  try {
    const { status } = req.body;
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    department.status = status;
    await department.save();

    res.status(200).json({
      success: true,
      message: `Department status updated to ${department.status}`,
      department
    });
  } catch (error) {
    next(error);
  }
};

// --- Patient CRUD ---
export const createPatientAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone, gender, dateOfBirth, bloodGroup, address, allergies, medicalHistory } = req.body;
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password: password || 'patient123', role: 'Patient', phone, gender });
    const patient = await Patient.create({
      userId: user.id,
      dateOfBirth,
      bloodGroup,
      address,
      allergies: allergies || [],
      medicalHistory: medicalHistory || []
    });

    res.status(201).json({ success: true, user, patient });
  } catch (error) {
    next(error);
  }
};

export const updatePatientAdmin = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const user = await User.findByPk(patient.userId);
    const { name, phone, gender, email, dateOfBirth, bloodGroup, address, allergies, medicalHistory } = req.body;

    if (user) {
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (gender) user.gender = gender;
      if (email) user.email = email;
      await user.save();
    }

    if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (address) patient.address = address;
    if (allergies) patient.allergies = allergies;
    if (medicalHistory) patient.medicalHistory = medicalHistory;
    await patient.save();

    res.status(200).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
};

export const deletePatientAdmin = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const user = await User.findByPk(patient.userId);
    if (user) {
      await user.destroy();
    } else {
      await patient.destroy();
    }

    res.status(200).json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- Doctor CRUD ---
export const updateDoctorAdmin = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const user = await User.findByPk(doctor.userId);
    const { name, phone, gender, email, specialization, departmentId, hospitalId, experience, fees, qualifications, biography, languages, availability, status } = req.body;

    if (user) {
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (gender) user.gender = gender;
      if (email) user.email = email;
      await user.save();
    }

    if (specialization) doctor.specialization = specialization;
    if (departmentId) doctor.departmentId = departmentId;
    if (hospitalId !== undefined) doctor.hospitalId = hospitalId;
    if (experience !== undefined) doctor.experience = parseInt(experience);
    if (fees !== undefined) doctor.fees = parseInt(fees);
    if (qualifications) doctor.qualifications = qualifications;
    if (biography !== undefined) doctor.biography = biography;
    if (languages) doctor.languages = languages;
    if (availability) doctor.availability = availability;
    if (status) doctor.status = status;
    await doctor.save();

    res.status(200).json({ success: true, doctor });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctorAdmin = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const user = await User.findByPk(doctor.userId);
    if (user) {
      await user.destroy();
    } else {
      await doctor.destroy();
    }

    res.status(200).json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- Appointment CRUD ---
export const getAllAppointmentsAdmin = async (req, res, next) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: User, as: 'patient', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Hospital, as: 'hospital', attributes: ['id', 'name'] }
      ],
      order: [['date', 'DESC'], ['timeSlot', 'ASC']]
    });

    const formatted = appointments.map(app => {
      const plain = app.toJSON();
      return {
        ...plain,
        _id: plain.id,
        patientId: plain.patient ? { ...plain.patient, _id: plain.patient.id } : null,
        doctorId: plain.doctor ? { ...plain.doctor, _id: plain.doctor.id } : null,
      };
    });

    res.status(200).json({ success: true, count: formatted.length, appointments: formatted });
  } catch (error) {
    next(error);
  }
};

export const createAppointmentAdmin = async (req, res, next) => {
  try {
    const { patientId, doctorId, hospitalId, date, timeSlot, reason, status } = req.body;
    
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await Appointment.count({
      where: { appointmentNumber: { [Op.like]: `APT-${todayStr}-%` } }
    });
    const appointmentNumber = `APT-${todayStr}-${String(countToday + 1).padStart(4, '0')}`;

    const countDoctorAppointments = await Appointment.count({
      where: { doctorId, date }
    });
    const tokenNumber = String(countDoctorAppointments + 1).padStart(3, '0');

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      hospitalId: hospitalId || null,
      appointmentNumber,
      tokenNumber,
      date,
      timeSlot,
      reason,
      status: status || 'Pending',
    });

    const docProfile = await Doctor.findOne({ where: { userId: doctorId } });
    const billingDate = new Date().toISOString().slice(0, 10);
    const invoiceNumber = `INV-${todayStr}-${String(countToday + 1).padStart(4, '0')}`;
    const amount = docProfile ? docProfile.fees : 500;

    await Bill.create({
      appointmentId: appointment.id,
      patientId,
      doctorId,
      invoiceNumber,
      amount,
      status: 'Unpaid',
      paymentMethod: 'Pending',
      billingDate,
    });

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentAdmin = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    await appointment.update(req.body);
    res.status(200).json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

export const deleteAppointmentAdmin = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    await appointment.destroy();
    res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- Billing/Payments CRUD ---
export const getAllBillsAdmin = async (req, res, next) => {
  try {
    const bills = await Bill.findAll({
      include: [
        { model: User, as: 'patient', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Appointment, as: 'appointment', attributes: ['id', 'appointmentNumber', 'date'] }
      ],
      order: [['billingDate', 'DESC']]
    });

    const formatted = bills.map(b => {
      const plain = b.toJSON();
      return {
        ...plain,
        _id: plain.id,
        patientId: plain.patient ? { ...plain.patient, _id: plain.patient.id } : null,
        doctorId: plain.doctor ? { ...plain.doctor, _id: plain.doctor.id } : null,
      };
    });

    res.status(200).json({ success: true, count: formatted.length, bills: formatted });
  } catch (error) {
    next(error);
  }
};

export const createBillAdmin = async (req, res, next) => {
  try {
    const { appointmentId, patientId, doctorId, amount, status, paymentMethod, billingDate } = req.body;
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await Bill.count({});
    const invoiceNumber = `INV-${todayStr}-${String(countToday + 1).padStart(4, '0')}`;

    const bill = await Bill.create({
      appointmentId: appointmentId || null,
      patientId,
      doctorId,
      invoiceNumber,
      amount: parseInt(amount) || 0,
      status: status || 'Unpaid',
      paymentMethod: paymentMethod || 'Pending',
      billingDate: billingDate || new Date().toISOString().slice(0, 10)
    });

    res.status(201).json({ success: true, bill });
  } catch (error) {
    next(error);
  }
};

export const updateBillAdmin = async (req, res, next) => {
  try {
    const bill = await Bill.findByPk(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    await bill.update(req.body);
    res.status(200).json({ success: true, bill });
  } catch (error) {
    next(error);
  }
};

export const deleteBillAdmin = async (req, res, next) => {
  try {
    const bill = await Bill.findByPk(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    await bill.destroy();
    res.status(200).json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- Medical Records CRUD ---
export const getAllMedicalRecordsAdmin = async (req, res, next) => {
  try {
    const records = await MedicalRecord.findAll({
      include: [
        { model: User, as: 'patient', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'doctor', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formatted = records.map(r => {
      const plain = r.toJSON();
      return {
        ...plain,
        _id: plain.id,
        patientId: plain.patient ? { ...plain.patient, _id: plain.patient.id } : null,
        doctorId: plain.doctor ? { ...plain.doctor, _id: plain.doctor.id } : null,
      };
    });

    res.status(200).json({ success: true, count: formatted.length, records: formatted });
  } catch (error) {
    next(error);
  }
};

export const createMedicalRecordAdmin = async (req, res, next) => {
  try {
    const { patientId, doctorId, diagnosis, treatment, prescriptions, notes } = req.body;
    const record = await MedicalRecord.create({
      patientId,
      doctorId,
      diagnosis,
      treatment,
      prescriptions: prescriptions ? (typeof prescriptions === 'string' ? JSON.parse(prescriptions) : prescriptions) : [],
      notes: notes || ''
    });

    res.status(201).json({ success: true, record });
  } catch (error) {
    next(error);
  }
};

export const updateMedicalRecordAdmin = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    await record.update(req.body);
    res.status(200).json({ success: true, record });
  } catch (error) {
    next(error);
  }
};

export const deleteMedicalRecordAdmin = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    await record.destroy();
    res.status(200).json({ success: true, message: 'Medical record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
