import Bull from 'bull';
import { smsService } from '../services/notification/smsService.js';

const REDIS_URL = process.env.REDIS_URL;
export const smsQueue = REDIS_URL ? new Bull('sms', REDIS_URL, {
  redis: {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  }
}) : null;

if (smsQueue) {
  smsQueue.on('error', (error) => {
    console.error('smsQueue Redis error:', error.message || error);
  });

  smsQueue.process('sendSMS', 3, async (job) => {
    await smsService.sendSMS(job.data);
  });
}

