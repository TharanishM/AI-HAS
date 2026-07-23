import express from 'express';
import {
  consultHealthAssistant,
  getAIHistory,
} from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/consult', protect, authorize('Patient'), consultHealthAssistant);
router.get('/history', protect, authorize('Patient'), getAIHistory);

export default router;
