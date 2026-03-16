import { emailService } from './emailService.js';

export const sendPasswordResetOTPEmail = async (user: any, otp: string, ipAddress?: string) => {
  return emailService.sendEmail({
    to: user.email,
    subject: '🔐 Your LookRooms Password Reset OTP',
    templateName: 'reset-password-otp',
    data: {
      userId: user._id,
      userName: user.name,
      otpCode: otp,
      expiresIn: '10 minutes',
      ipAddress: ipAddress || 'Unknown',
      requestTime: new Date().toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' }),
      supportUrl: process.env.APP_URL + '/support',
      unsubscribeToken: user.unsubscribeToken
    }
  });
};

export const sendPasswordChangedEmail = async (user: any) => {
  return emailService.sendEmail({
    to: user.email,
    subject: '✅ Password Changed Successfully',
    templateName: 'password-changed',
    data: {
      userName: user.name,
      time: new Date().toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' }),
      supportUrl: process.env.APP_URL + '/support'
    }
  });
};
