import express from 'express';
import {
  bookAppointment,
  getAppointments,
  rescheduleAppointment,
  updateAppointmentStatus,
  createMedicalRecord,
  getMedicalRecords,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('Patient'), bookAppointment);
router.get('/', protect, getAppointments);
router.put('/:id/reschedule', protect, rescheduleAppointment);
router.put('/:id/status', protect, updateAppointmentStatus);
router.post('/:id/medical-record', protect, authorize('Doctor'), createMedicalRecord);
router.get('/medical-records', protect, getMedicalRecords);

export default router;
