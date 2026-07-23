import express from 'express';
import {
  getDepartments,
  getAllDepartmentsAdmin,
  createDepartment,
  updateDepartment,
  toggleDepartmentStatus,
} from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDepartments);
router.get('/all', protect, authorize('Admin'), getAllDepartmentsAdmin);
router.post('/', protect, authorize('Admin'), createDepartment);
router.put('/:id', protect, authorize('Admin'), updateDepartment);
router.delete('/:id', protect, authorize('Admin'), toggleDepartmentStatus);

export default router;
