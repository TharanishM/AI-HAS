import express from 'express';
import {
  getDoctors,
  getDoctorById,
  updateDoctorAvailability,
} from '../controllers/doctorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/:id/availability', protect, updateDoctorAvailability);

export default router;
