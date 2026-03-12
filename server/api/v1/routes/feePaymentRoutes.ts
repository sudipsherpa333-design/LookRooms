import express from 'express';
import { initiatePayment, verifyPayment } from '../controllers/feePaymentController.js';
import { authMiddleware } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initiate', authMiddleware, initiatePayment);
router.post('/verify', authMiddleware, verifyPayment);

export default router;
