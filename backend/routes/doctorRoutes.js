import express from 'express';
import {
  getDoctors,
  getDoctorById,
  updateDoctorAvailability,
  addDoctorReview,
  toggleDoctorOnlineStatus,
} from '../controllers/doctorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/:id/availability', protect, updateDoctorAvailability);
router.post('/:id/reviews', protect, addDoctorReview);
router.put('/:id/status-toggle', protect, toggleDoctorOnlineStatus);

export default router;
