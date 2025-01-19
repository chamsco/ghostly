import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379',
  socket: {
    host: 'redis',
    port: 6379
  }
});

// Initialize Redis client
(async () => {
  await redisClient.connect();
})().catch(console.error);

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

const RedisStore = connectRedis(session);

export const sessionConfig: session.SessionOptions = {
  store: new RedisStore({ 
    client: redisClient,
    prefix: 'ghostly:session:'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'ghostly.sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: 'lax'
  }
};