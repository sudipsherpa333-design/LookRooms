import express from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis from '../../../utils/redis.js';
import { login, register, refreshToken, logout } from '../controllers/authController.js';
import { sendOTP, verifyOTP, resetPassword, resendOTP } from '../controllers/forgotPasswordController.js';

const router = express.Router();

// Rate limiters
const sendOTPLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error - ioredis type mismatch with rate-limit-redis
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per IP per hour
  message: { error: 'Too many OTP requests from this IP. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyOTPLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error - ioredis type mismatch with rate-limit-redis
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per IP per hour
  message: { error: 'Too many verification attempts. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', [
  body('phone').isString().notEmpty(),
  body('password').isString().notEmpty(),
], login);

router.post('/register', [
  body('phone').isString().notEmpty(),
  body('password').isLength({ min: 6 }),
  body('name').isString().notEmpty(),
], register);

router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Forgot Password Routes
router.post('/forgot-password/send-otp', sendOTPLimiter, sendOTP);
router.post('/forgot-password/verify-otp', verifyOTPLimiter, verifyOTP);
router.post('/forgot-password/reset', resetPassword);
router.post('/forgot-password/resend-otp', sendOTPLimiter, resendOTP);

export default router;
