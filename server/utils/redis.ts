import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;
let redis: any = null;

if (REDIS_URL) {
  try {
    // Clean up the URL if it contains extra characters
    const cleanUrl = REDIS_URL.split(' ')[0];
    redis = new Redis(cleanUrl);
    redis.on('error', (err: any) => console.error('Redis Error:', err));
    redis.on('connect', () => console.log('Connected to Redis'));
  } catch (err) {
    console.error('Failed to initialize Redis:', err);
  }
} else {
  console.log('REDIS_URL not provided, rate limiting will use memory store.');
}

export default redis;

