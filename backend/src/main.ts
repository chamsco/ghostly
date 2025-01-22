import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configure CORS
  app.enableCors({
    origin: ['http://localhost:3001', 'http://168.119.111.140:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Session middleware
  app.use(
    session({
      secret: configService.get('SESSION_SECRET') || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // Set to false for HTTP
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: 'lax',
        path: '/',
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  await app.listen(3000, '0.0.0.0');
}
bootstrap(); 