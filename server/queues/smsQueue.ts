import Bull from 'bull';
import { smsService } from '../services/notification/smsService.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis-16329.crce220.us-east-1-4.ec2.cloud.redislabs.com:16329';
export const smsQueue = new Bull('sms', REDIS_URL);

smsQueue.process('sendSMS', 3, async (job) => {
  await smsService.sendSMS(job.data);
});

