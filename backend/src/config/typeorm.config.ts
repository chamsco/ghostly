import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Device } from '../auth/entities/device.entity';
import { Project } from '../projects/entities/project.entity';
import { Resource } from '../projects/entities/resource.entity';
import { Environment } from '../projects/entities/environment.entity';
import { EnvironmentVariable } from '../projects/entities/environment-variable.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'squadronuser',
  password: process.env.DB_PASSWORD || 'squadronpass',
  database: process.env.DB_DATABASE || 'squadron',
  entities: [User, Device, Project, Resource, Environment, EnvironmentVariable],
  synchronize: true, // Temporarily enable for initial setup
  logging: true,
  dropSchema: false, // Don't drop existing tables
}; 