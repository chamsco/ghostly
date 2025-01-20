import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Device } from '../auth/entities/device.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'squadronuser',
  password: process.env.DB_PASSWORD || 'squadronpass',
  database: process.env.DB_DATABASE || 'squadron',
  entities: [User, Device],
  synchronize: true, // Temporarily enable for initial setup
  logging: true,
  dropSchema: false, // Don't drop existing tables
}; 