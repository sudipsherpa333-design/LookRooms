import express from 'express';
import * as reviewController from '../controllers/ReviewController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/listing/:listingId', reviewController.getListingReviews);
router.get('/user/:userId', reviewController.getUserReviews);

router.use(protect);

router.post('/submit', reviewController.submitReview);

export default router;
