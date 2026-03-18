import Bull from 'bull';
import { emailService } from '../services/email/emailService.js';
import { EmailLog } from '../models/EmailLog.js';
import { Notification } from '../models/Notification.js';

const REDIS_URL = process.env.REDIS_URL;
export const emailQueue = REDIS_URL ? new Bull('email', REDIS_URL, {
  redis: {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  }
}) : null;

if (emailQueue) {
  emailQueue.on('error', (error) => {
    console.error('emailQueue Redis error:', error.message || error);
  });

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
}
