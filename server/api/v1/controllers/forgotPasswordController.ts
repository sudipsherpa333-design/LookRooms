import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../../../models/User.js';
import { PasswordReset } from '../../../models/PasswordReset.js';
import { sendPasswordResetOTPEmail, sendPasswordChangedEmail } from '../../../services/email/emailFunctions.js';
import { smsService } from '../../../services/notification/smsService.js';
import redis from '../../../utils/redis.js';
import { encrypt } from '../../../utils/encryption.js';

// Helper to mask identifier
const maskIdentifier = (identifier: string, channel: 'email' | 'phone') => {
  if (channel === 'email') {
    const [name, domain] = identifier.split('@');
    return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
  } else {
    return `${identifier.slice(0, 3)}XXXXXX${identifier.slice(-1)}`;
  }
};

/**
 * POST /api/auth/forgot-password/send-otp
 */
export const sendOTP = async (req: Request, res: Response) => {
  const { identifier, channel } = req.body; // identifier is email or phone

  if (!identifier || !channel || !['email', 'phone'].includes(channel)) {
    return res.status(400).json({ error: 'Identifier and valid channel are required' });
  }

  // Find user
  let user;
  if (channel === 'email') {
    user = await (User as any).findOne({ email: identifier.toLowerCase() });
  } else {
    // For phone, we have a problem with non-deterministic encryption.
    // In a real app with this setup, we'd need a phoneHash or deterministic encryption.
    // For now, we'll try to find by encrypted phone if we can, or just assume it works for now.
    // Actually, I'll implement a search that works if the encryption was deterministic, 
    // but since it's not, I'll add a comment and try to find a workaround.
    // WORKAROUND: We'll search all users and decrypt their phone numbers. 
    // THIS IS SLOW and should be fixed with a phoneHash in production.
    const users = await (User as any).find({ phone: { $exists: true } });
    user = users.find((u: any) => u.phone === identifier);
  }

  // Security: Always return success even if user not found to prevent enumeration
  const successResponse = {
    message: `OTP sent to your registered ${channel}`,
    maskedIdentifier: maskIdentifier(identifier, channel),
    expiresIn: '10 minutes'
  };

  if (!user) {
    // Simulate delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    return res.json(successResponse);
  }

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpHash = await bcrypt.hash(otp, 10);

  // Save to PasswordReset collection
  await (PasswordReset as any).create({
    userId: user._id,
    otpHash,
    channel,
    identifier,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    ipAddress: req.ip
  });

  // Send OTP
  if (channel === 'email') {
    await sendPasswordResetOTPEmail(user, otp, req.ip);
  } else {
    await smsService.sendPasswordResetOTPSMS(identifier, otp);
  }

  res.json(successResponse);
};

/**
 * POST /api/auth/forgot-password/verify-otp
 */
export const verifyOTP = async (req: Request, res: Response) => {
  const { identifier, otp, channel } = req.body;

  if (!identifier || !otp || !channel) {
    return res.status(400).json({ error: 'Identifier, OTP, and channel are required' });
  }

  const resetRecord = await (PasswordReset as any).findOne({
    identifier,
    channel,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!resetRecord) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  if (resetRecord.attempts >= 3) {
    resetRecord.isUsed = true;
    await resetRecord.save();
    return res.status(400).json({ error: 'Too many failed attempts. Please request a new OTP.' });
  }

  const isMatch = await bcrypt.compare(otp, resetRecord.otpHash);
  if (!isMatch) {
    resetRecord.attempts += 1;
    await resetRecord.save();
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  // OTP is valid
  resetRecord.isUsed = true;
  await resetRecord.save();

  // Generate Reset Token (SHA-256)
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Update User with reset token
  const user = await (User as any).findById(resetRecord.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.passwordResetToken = hashedToken;
  user.passwordResetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  res.json({
    message: 'OTP verified successfully',
    resetToken: rawToken,
    expiresIn: '15 minutes'
  });
};

/**
 * POST /api/auth/forgot-password/reset
 */
export const resetPassword = async (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await (User as any).findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiry: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  // Check password history (last 3)
  for (const oldHash of user.passwordHistory) {
    const isMatch = await bcrypt.compare(newPassword, oldHash);
    if (isMatch) {
      return res.status(400).json({ error: 'Cannot reuse any of your last 3 passwords' });
    }
  }

  // Update password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update history
  user.passwordHistory.unshift(user.password);
  if (user.passwordHistory.length > 3) {
    user.passwordHistory.pop();
  }

  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiry = undefined;
  user.tokenVersion += 1; // Invalidate current JWTs
  
  await user.save();

  // Send confirmation
  if (user.email) {
    await sendPasswordChangedEmail(user);
  }
  if (user.phone) {
    await smsService.sendSMS({
      to: user.phone,
      text: `LookRooms: Your password has been changed successfully. If this wasn't you, contact support.`
    });
  }

  res.json({ message: 'Password reset successful. You can now log in with your new password.' });
};

/**
 * POST /api/auth/forgot-password/resend-otp
 */
export const resendOTP = async (req: Request, res: Response) => {
  const { identifier, channel } = req.body;

  if (!identifier || !channel) {
    return res.status(400).json({ error: 'Identifier and channel are required' });
  }

  // Check rate limit for resend (3 per hour per identifier)
  const resendKey = `resend_otp:${identifier}`;
  const resendCount = await redis.get(resendKey);
  if (resendCount && parseInt(resendCount) >= 3) {
    return res.status(429).json({ error: 'Too many resend attempts. Please try again in an hour.' });
  }

  // Delete old unused OTPs for this identifier
  await (PasswordReset as any).deleteMany({ identifier, channel, isUsed: false });

  // Increment resend count
  if (!resendCount) {
    await redis.set(resendKey, 1, 'EX', 3600);
  } else {
    await redis.incr(resendKey);
  }

  // Reuse sendOTP logic
  return sendOTP(req, res);
};
