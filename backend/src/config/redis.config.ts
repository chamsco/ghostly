import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  } : undefined,
  retryStrategy: (times: number) => {
    if (times > 3) {
      throw new Error('Redis connection failed after 3 retries');
    }
    return Math.min(times * 200, 1000);
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: false,
  connectTimeout: 10000,
  disconnectTimeout: 2000,
  keepAlive: 30000,
  keyPrefix: 'squadron:',
  rateLimiter: {
    points: 10,
    duration: 1,
    blockDuration: 600,
  }
})); 