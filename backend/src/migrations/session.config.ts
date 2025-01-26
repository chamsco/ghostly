import session from 'express-session';
import connectRedis from 'connect-redis';
import { createClient, RedisClientType } from 'redis';

export const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

// Initialize Redis client
redisClient.connect().catch(console.error);

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

const RedisStore = connectRedis(session);

export const sessionConfig: session.SessionOptions = {
  store: new RedisStore({ 
    client: redisClient,
    prefix: 'squadron:session:'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'squadron.sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: 'lax'
  }
};