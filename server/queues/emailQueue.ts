import Bull from 'bull';
import { emailService } from '../services/email/emailService';
import { EmailLog } from '../models/EmailLog';
import { Notification } from '../models/Notification';

const redisConfig = { redis: { port: 6379, host: '127.0.0.1' } };
export const emailQueue = new Bull('email', redisConfig);

emailQueue.process('sendEmail', 5, async (job) => {
  const { notificationId, to, subject, templateName, templateData } = job.data;
  try {
    await emailService.sendEmail({ to, subject, templateName, templateData });
    await EmailLog.findOneAndUpdate(
      { notificationId },
      { status: 'sent', sentAt: new Date(), attempts: job.attemptsMade }
    );
    await Notification.updateOne(
      { _id: notificationId },
      { 'channels.email.sent': true, 'channels.email.sentAt': new Date() }
    );
  } catch (error: any) {
    await EmailLog.findOneAndUpdate(
      { notificationId },
      { status: 'failed', error: error.message, attempts: job.attemptsMade }
    );
    throw error;
  }
});
