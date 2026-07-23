import express from 'express';
import {
  registerPatient,
  registerDoctor,
  login,
  getMe,
  updateProfile,
  uploadAvatar,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/register', registerPatient);
router.post('/register-doctor', upload.single('avatar'), registerDoctor);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', protect, changePassword);
router.post('/refresh-token', refreshToken);

export default router;
