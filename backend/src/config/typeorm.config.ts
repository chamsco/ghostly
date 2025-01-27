import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Device } from '../auth/entities/device.entity';
import { Project } from '../projects/entities/project.entity';
import { Resource } from '../projects/entities/resource.entity';
import { Environment } from '../projects/entities/environment.entity';
import { EnvironmentVariable } from '../projects/entities/environment-variable.entity';
import { Server } from '../servers/entities/server.entity';
import { InitialSchema1710000000000 } from '../migrations/1710000000000-InitialSchema';
import { CreateProjectsTable1710000000001 } from '../migrations/1710000000001-CreateProjectsTable';
import { CreateResourcesTable1710000000002 } from '../migrations/1710000000002-CreateResourcesTable';
import { CreateEnvironmentVariablesTable1710000000004 } from '../migrations/1710000000004-CreateEnvironmentVariablesTable';
import { AddResourceIndexes1710000000007 } from '../migrations/1710000000007-AddResourceIndexes';
import { AddServerAndEnvironmentIds1710000000005 } from '../migrations/1710000000005-AddServerAndEnvironmentIds';
import { CleanupResourceEnums1710000000006 } from '../migrations/1710000000006-CleanupResourceEnums';
import { CreateEnvironmentsTable1710000000003 } from '../migrations/1710000000003-CreateEnvironmentsTable';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'squadronuser',
  password: process.env.DB_PASSWORD || 'squadronpass',
  database: process.env.DB_DATABASE || 'squadron',
  entities: [User, Device, Project, Resource, Environment, EnvironmentVariable, Server],
  migrations: [
    InitialSchema1710000000000,
    CreateProjectsTable1710000000001,
    CreateResourcesTable1710000000002,
    CreateEnvironmentsTable1710000000003,
    CreateEnvironmentVariablesTable1710000000004,
    AddServerAndEnvironmentIds1710000000005,
    CleanupResourceEnums1710000000006,
    AddResourceIndexes1710000000007,
  ],
  migrationsRun: true,
  migrationsTransactionMode: 'all',
  synchronize: false,
  logging: ['error', 'warn', 'migration'],
  dropSchema: process.env.NODE_ENV !== 'production',
}; 