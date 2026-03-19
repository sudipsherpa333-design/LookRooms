import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;
let redis: any = null;

// Redis is disabled for now to prevent connection errors in environments without Redis.
/*
if (REDIS_URL) {
  try {
    // Clean up the URL if it contains extra characters
    const cleanUrl = REDIS_URL.split(' ')[0];
    redis = new Redis(cleanUrl, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        if (times > 5) {
          console.error("Redis connection failed after 5 retries. Disabling Redis.");
          return null; // Stop retrying
        }
        return delay;
      }
    });
    redis.on('error', (err: any) => console.error('Redis Error:', err));
    redis.on('connect', () => console.log('Connected to Redis'));
  } catch (err) {
    console.error('Failed to initialize Redis:', err);
  }
} else {
  console.log('REDIS_URL not provided, rate limiting will use memory store.');
}
*/

export default redis;

