import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { User } from './users/entities/user.entity';
import { Device } from './auth/entities/device.entity';
import { Project } from './projects/entities/project.entity';
import { SecurityMiddleware } from './middleware/security.middleware';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'postgres'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'squadronuser'),
        password: configService.get('DB_PASSWORD', 'squadronpass'),
        database: configService.get('DB_DATABASE', 'squadron'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV', 'development') === 'development',
        logging: configService.get('NODE_ENV', 'development') === 'development'
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { 
          expiresIn: '1d'
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    MetricsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware)
      .forRoutes('*');
  }
} 