import express from 'express';
import {
  getDashboardAnalytics,
  getAllPatients,
  registerDoctor,
  toggleDoctorStatus,
  getPendingApprovals,
  approveDoctor,
  approveHospital,
  approveDepartment,
  createPatientAdmin,
  updatePatientAdmin,
  deletePatientAdmin,
  updateDoctorAdmin,
  deleteDoctorAdmin,
  getAllAppointmentsAdmin,
  createAppointmentAdmin,
  updateAppointmentAdmin,
  deleteAppointmentAdmin,
  getAllBillsAdmin,
  createBillAdmin,
  updateBillAdmin,
  deleteBillAdmin,
  getAllMedicalRecordsAdmin,
  createMedicalRecordAdmin,
  updateMedicalRecordAdmin,
  exportReportExcel,
  exportReportPDF,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.get('/analytics', getDashboardAnalytics);

// Pending approvals
router.get('/approvals', getPendingApprovals);
router.put('/approvals/doctors/:id', approveDoctor);
router.put('/approvals/hospitals/:id', approveHospital);
router.put('/approvals/departments/:id', approveDepartment);

// Patients CRUD
router.get('/patients', getAllPatients);
router.post('/patients', createPatientAdmin);
router.put('/patients/:id', updatePatientAdmin);
router.delete('/patients/:id', deletePatientAdmin);

// Doctors CRUD
router.post('/doctors', registerDoctor);
router.put('/doctors/:id', updateDoctorAdmin);
router.delete('/doctors/:id', deleteDoctorAdmin);
router.put('/doctors/:id/status', toggleDoctorStatus);

// Appointments CRUD
router.get('/appointments', getAllAppointmentsAdmin);
router.post('/appointments', createAppointmentAdmin);
router.put('/appointments/:id', updateAppointmentAdmin);
router.delete('/appointments/:id', deleteAppointmentAdmin);

// Bills CRUD
router.get('/bills', getAllBillsAdmin);
router.post('/bills', createBillAdmin);
router.put('/bills/:id', updateBillAdmin);
router.delete('/bills/:id', deleteBillAdmin);

// Medical Records CRUD
router.get('/medical-records', getAllMedicalRecordsAdmin);
router.post('/medical-records', createMedicalRecordAdmin);
router.put('/medical-records/:id', updateMedicalRecordAdmin);
router.delete('/medical-records/:id', deleteMedicalRecordAdmin);

// Reports Export
router.get('/reports/excel', exportReportExcel);
router.get('/reports/pdf', exportReportPDF);

export default router;
