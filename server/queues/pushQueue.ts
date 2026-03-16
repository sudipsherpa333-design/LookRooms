import Bull from 'bull';
import { pushService } from '../services/notification/pushService.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis-16329.crce220.us-east-1-4.ec2.cloud.redislabs.com:16329';
export const pushQueue = new Bull('push', REDIS_URL);

pushQueue.process('sendPush', 10, async (job) => {
  await pushService.sendPush(job.data);
});

