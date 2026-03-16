import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { User } from '../../../models/User.js';
import { generateTokens, blacklistToken } from '../../../services/authService.js';
import { nanoid } from 'nanoid';
import { catchAsync } from '../../../utils/catchAsync.js';

export const login = catchAsync(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { phone, password } = req.body;
  const user = await User.findOne({ phone });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  if (user.lockUntil && user.lockUntil > new Date()) {
    return res.status(429).json({ error: 'Account locked. Try again later.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.save();
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastIp = req.ip;
  await user.save();

  const jti = nanoid();
  const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role, jti);

  user.refreshTokens.push({ token: refreshToken, userAgent: req.headers['user-agent'], ip: req.ip });
  await user.save();

  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ accessToken });
});

export const register = catchAsync(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { phone, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = new User({ phone, password: hashedPassword, name });
  await user.save();
  res.status(201).json({ message: 'User registered successfully' });
});

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  
  // Verify and rotate token
  // ... (implementation details)
  res.json({ message: 'Token refreshed' });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});
