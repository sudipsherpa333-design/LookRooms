import express from 'express';
import { body } from 'express-validator';
import { login, register, refreshToken, logout } from '../controllers/authController.js';

const router = express.Router();

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

export default router;
