import express from 'express';
import * as applicationController from '../controllers/ApplicationController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('tenant'), applicationController.createApplication);
router.get('/my-applications', restrictTo('tenant'), applicationController.getMyApplications);
router.get('/landlord-applications', restrictTo('landlord', 'admin'), applicationController.getLandlordApplications);
router.patch('/:id/status', restrictTo('landlord', 'admin'), applicationController.updateApplicationStatus);

export default router;
