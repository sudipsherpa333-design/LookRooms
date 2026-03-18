import jwt from 'jsonwebtoken';
import redis from '../utils/redis.js';
import { User } from '../models/User.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

export const generateTokens = (userId: string, role: string, jti: string) => {
  const accessToken = jwt.sign({ userId, role, jti }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, jti }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const blacklistToken = async (jti: string, exp: number) => {
  const now = Math.floor(Date.now() / 1000);
  const ttl = exp - now;
  if (ttl > 0) {
    try {
      if (redis && redis.status === 'ready') {
        await redis.set(`blacklist:${jti}`, 'true', 'EX', ttl);
      }
    } catch (err) {
      console.error('Redis error during blacklistToken:', err);
    }
  }
};

export const isTokenBlacklisted = async (jti: string) => {
  try {
    if (redis && redis.status === 'ready') {
      const blacklisted = await redis.get(`blacklist:${jti}`);
      return !!blacklisted;
    }
  } catch (err) {
    console.error('Redis error during isTokenBlacklisted:', err);
  }
  return false;
};
