import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;
let redis: any = null;

if (REDIS_URL) {
  try {
    redis = new Redis(REDIS_URL);
    redis.on('error', (err: any) => console.error('Redis Error:', err));
    redis.on('connect', () => console.log('Connected to Redis'));
  } catch (err) {
    console.error('Failed to initialize Redis:', err);
  }
} else {
  console.log('REDIS_URL not provided, rate limiting will use memory store.');
}

export default redis;

