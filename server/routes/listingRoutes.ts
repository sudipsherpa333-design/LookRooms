import express from 'express';
import * as listingController from '../controllers/ListingController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', listingController.getAllListings);
router.get('/:id', listingController.getListing);

router.use(protect);

router.post('/', restrictTo('landlord', 'admin'), listingController.createListing);
router.patch('/:id', restrictTo('landlord', 'admin'), listingController.updateListing);
router.delete('/:id', restrictTo('landlord', 'admin'), listingController.deleteListing);

export default router;
