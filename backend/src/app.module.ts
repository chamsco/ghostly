import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ServersModule } from './servers/servers.module';
import { ResourcesModule } from './resources/resources.module';
import { User } from './users/entities/user.entity';
import { Device } from './auth/entities/device.entity';
import { Project } from './projects/entities/project.entity';
import { Resource } from './resources/entities/resource.entity';
import { Environment } from './projects/entities/environment.entity';
import { EnvironmentVariable } from './projects/entities/environment-variable.entity';
import { SecurityMiddleware } from './middleware/security.middleware';
import { MetricsModule } from './metrics/metrics.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Device, Project, Resource, Environment, EnvironmentVariable],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    ServersModule,
    ResourcesModule,
    MetricsModule,
    DashboardModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
} 