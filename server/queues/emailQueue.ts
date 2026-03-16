import Bull from 'bull';
import { emailService } from '../services/email/emailService.js';
import { EmailLog } from '../models/EmailLog.js';
import { Notification } from '../models/Notification.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis-16329.crce220.us-east-1-4.ec2.cloud.redislabs.com:16329';
export const emailQueue = new Bull('email', REDIS_URL);

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
