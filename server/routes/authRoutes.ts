import express from 'express';
import * as authController from '../controllers/AuthController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.patch('/updateMe', protect, authController.updateMe);

export default router;
