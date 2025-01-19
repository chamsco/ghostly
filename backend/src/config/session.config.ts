import * as session from 'express-session';
import { createClient } from 'redis';
import * as connectRedis from 'connect-redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.connect().catch(console.error);

// Create RedisStore
const RedisStore = connectRedis(session);

export const sessionConfig: session.SessionOptions = {
  store: new RedisStore({
    client: redisClient,
    prefix: 'ghostly:session:',
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}; 