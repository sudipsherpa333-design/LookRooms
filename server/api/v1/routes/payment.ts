import express from 'express';
import { 
  initiatePayment, 
  verifyPayment, 
  retryPayment, 
  getFeePreview, 
  getPaymentHistory, 
  getOneTapStatus, 
  deleteOneTapToken 
} from '../controllers/paymentController.js';
import { authMiddleware } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initiate', authMiddleware, initiatePayment);
router.post('/verify', authMiddleware, verifyPayment);
router.post('/retry/:paymentId', authMiddleware, retryPayment);
router.get('/fee-preview/:listingId', getFeePreview);
router.get('/history', authMiddleware, getPaymentHistory);
router.get('/one-tap-status', authMiddleware, getOneTapStatus);
router.delete('/one-tap-token/:gateway', authMiddleware, deleteOneTapToken);

export default router;
