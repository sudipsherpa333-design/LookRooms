import Bull from 'bull';
import { smsService } from '../services/notification/smsService';

const redisConfig = { redis: { port: 6379, host: '127.0.0.1' } };
export const smsQueue = new Bull('sms', redisConfig);

smsQueue.process('sendSMS', 3, async (job) => {
  await smsService.sendSMS(job.data);
});
