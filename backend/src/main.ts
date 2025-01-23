import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  console.log('Starting NestJS application...');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const allowedOrigins = ['http://168.119.111.140:3001', 'http://localhost:3001'];
  console.log('Configuring CORS with allowed origins:', allowedOrigins);
  
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('Origin rejected:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
  });

  // Add detailed request logging middleware with CORS headers
  app.use((req, res, next) => {
    console.log('=== Incoming Request ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Origin:', req.headers.origin);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('=======================');
    next();
  });

  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Session middleware with logging
  app.use(
    session({
      secret: configService.get('SESSION_SECRET') || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax',
        path: '/',
      },
    }),
  );

  // Remove global prefix as it might be causing issues
  // app.setGlobalPrefix('api');

  const port = configService.get('PORT') || 3000;
  console.log(`Starting server on port ${port}...`);
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap(); 