import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  measureEmission,
  getEmissionHistory,
  logReduction,
  purchaseOffset,
  getOffsetProjects,
  shareCredits
} from '../controllers/carbonController.js';
import {
  validateMeasure,
  validateReduce,
  validateOffset,
  validateShare,
  handleValidationErrors
} from '../utils/validators.js';

const router = express.Router();

router.post('/measure', authMiddleware, validateMeasure, handleValidationErrors, measureEmission);
router.get('/measure', authMiddleware, getEmissionHistory);
router.post('/reduce', authMiddleware, validateReduce, handleValidationErrors, logReduction);
router.post('/offset', authMiddleware, validateOffset, handleValidationErrors, purchaseOffset);
router.get('/offset/projects', getOffsetProjects);
router.post('/share', authMiddleware, validateShare, handleValidationErrors, shareCredits);

export default router;
