import express from 'express';
import { body } from 'express-validator';
import { createBookingRequest } from '../controllers/bookingRequestController.js';
import { respondToBooking } from '../controllers/landlordResponseController.js';
import { authMiddleware } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request', authMiddleware, [
  body('listingId').isMongoId(),
  body('moveInDate').isISO8601(),
  body('occupants').isInt({ min: 1 }),
], createBookingRequest);
router.put('/respond/:bookingRequestId', authMiddleware, respondToBooking);

export default router;
