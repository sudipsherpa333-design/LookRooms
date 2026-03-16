import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis-16329.crce220.us-east-1-4.ec2.cloud.redislabs.com:16329';
const redis = new Redis(REDIS_URL);

redis.on('error', (err) => console.error('Redis Error:', err));
redis.on('connect', () => console.log('Connected to Redis'));

export default redis;

