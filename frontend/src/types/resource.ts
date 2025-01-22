
export enum ResourceType {
  DATABASE = 'database',
  SERVICE = 'service',
  WEBSITE = 'website'
}

export enum DatabaseType {
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb',
  REDIS = 'redis'
}

export enum ServiceType {
  DOCKER = 'docker',
  DOCKER_COMPOSE = 'docker-compose',
  CUSTOM = 'custom'
}

export enum ResourceStatus {
  CREATED = 'created',
  RUNNING = 'running',
  STOPPED = 'stopped',
  ERROR = 'error'
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  status: ResourceStatus;
  config: Record<string, any>;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceDto {
  name: string;
  type: string;
  config: Record<string, any>;
} 