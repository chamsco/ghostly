export enum ResourceType {
  DATABASE = 'database',
  SERVICE = 'service',
  WEBSITE = 'website',
  GITHUB = 'github',
  GITLAB = 'gitlab',
  BITBUCKET = 'bitbucket'
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

export enum ProjectStatus {
  CREATED = 'created',
  DEPLOYING = 'deploying',
  RUNNING = 'running',
  STOPPED = 'stopped',
  FAILED = 'failed',
  ERROR = 'error'
}

export interface Resource {
  id: string;
  projectId: string;
  name: string;
  type: ResourceType;
  environment: Environment;
  config: ResourceConfig;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export type Environment = 'development' | 'staging' | 'production';
export type DeploymentTarget = 'localhost' | 'kubernetes' | 'aws';

export interface VCSConfig {
  repositoryUrl: string;
  branch: string;
  target: DeploymentTarget;
  port?: string;
}

export interface DatabaseConfig {
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface ServiceConfig {
  type: ServiceType;
  command?: string;
  env?: Record<string, string>;
}

export type ResourceConfig = VCSConfig | DatabaseConfig | ServiceConfig;

export interface CreateResourceDto {
  name: string;
  type: ResourceType;
  environment: Environment;
  config: ResourceConfig;
} 