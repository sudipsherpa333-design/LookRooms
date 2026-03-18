import Bull from 'bull';
import { pushService } from '../services/notification/pushService.js';

const REDIS_URL = process.env.REDIS_URL;
export const pushQueue = REDIS_URL ? new Bull('push', REDIS_URL, {
  redis: {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  }
}) : null;

if (pushQueue) {
  pushQueue.on('error', (error) => {
    console.error('pushQueue Redis error:', error.message || error);
  });

  pushQueue.process('sendPush', 10, async (job) => {
    await pushService.sendPush(job.data);
  });
}

