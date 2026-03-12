import express from 'express';
import { getFeePreview } from '../controllers/feeController.js';

const router = express.Router();

router.get('/preview/:listingId', getFeePreview);

export default router;
