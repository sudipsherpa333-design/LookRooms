import express from 'express';
import * as paymentController from '../controllers/PaymentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/initiate', paymentController.initiatePayment);
router.post('/verify', paymentController.verifyPayment);

export default router;
