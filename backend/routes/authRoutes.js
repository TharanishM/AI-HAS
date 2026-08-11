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
  enable2FA,
  disable2FA,
  verify2FA,
  verify2FALogin,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/register', registerPatient);
router.post('/register-doctor', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'degreeCertificate', maxCount: 1 },
  { name: 'medicalRegistrationCertificate', maxCount: 1 },
  { name: 'additionalQualificationCertificate', maxCount: 1 }
]), registerDoctor);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', protect, changePassword);
router.post('/refresh-token', refreshToken);

// Two-Factor Authentication (2FA) Routes
router.post('/2fa/enable', protect, enable2FA);
router.post('/2fa/disable', protect, disable2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/verify-login', verify2FALogin);

export default router;
