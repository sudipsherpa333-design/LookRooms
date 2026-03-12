import Bull from 'bull';
import { pushService } from '../services/notification/pushService';

const redisConfig = { redis: { port: 6379, host: '127.0.0.1' } };
export const pushQueue = new Bull('push', redisConfig);

pushQueue.process('sendPush', 10, async (job) => {
  await pushService.sendPush(job.data);
});
