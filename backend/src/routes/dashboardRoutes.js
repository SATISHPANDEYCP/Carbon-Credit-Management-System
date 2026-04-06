import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getDashboardSummary, getTransactionHistory } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/summary', authMiddleware, getDashboardSummary);
router.get('/transactions', authMiddleware, getTransactionHistory);

export default router;
