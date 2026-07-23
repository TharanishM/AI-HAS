import express from 'express';
import {
  createHospital,
  updateHospital,
  deleteHospital,
  getHospitals,
  getHospitalById,
} from '../controllers/hospitalController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(getHospitals)
  .post(
    protect,
    authorize('Admin'),
    upload.fields([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
    createHospital
  );

router.route('/:id')
  .get(getHospitalById)
  .put(
    protect,
    authorize('Admin'),
    upload.fields([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
    updateHospital
  )
  .delete(protect, authorize('Admin'), deleteHospital);

export default router;
