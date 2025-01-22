/**
 * Project and Resource Types
 * 
 * Defines types and interfaces for projects and their resources in the application
 */

export enum ResourceType {
  DATABASE = 'database',
  SERVICE = 'service',
  WEBSITE = 'website'
}

export enum DatabaseType {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  MONGODB = 'mongodb',
  NONE = 'none'
}

export enum ServiceType {
  NODEJS = 'nodejs',
  PYTHON = 'python',
  PHP = 'php',
  CUSTOM_DOCKER = 'custom_docker',
  SUPABASE = 'supabase',
  POCKETBASE = 'pocketbase',
  APPWRITE = 'appwrite'
}

export enum ProjectStatus {
  CREATED = 'created',
  DEPLOYING = 'deploying',
  RUNNING = 'running',
  STOPPED = 'stopped',
  FAILED = 'failed'
}

export interface EnvironmentVariable {
  key: string;
  value: string;
  isSecret: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  serverId: string;
  status: ProjectStatus;
  error?: string;
  environmentVariables?: EnvironmentVariable[];
  // Database specific fields
  databaseType?: DatabaseType;
  databaseName?: string;
  adminEmail?: string;
  initialDatabase?: string;
  dbPassword?: string;
  // Service specific fields
  serviceType?: ServiceType;
  repositoryUrl?: string;
  dockerComposeContent?: string;
  dockerImageUrl?: string;
  // Website specific fields
  branch?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  serverId: string;
  status: ProjectStatus;
  environments: Environment[];
  resources: Resource[];
  environmentVariables?: EnvironmentVariable[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  serverId: string;
  environmentVariables?: EnvironmentVariable[];
}

export interface CreateResourceDto {
  name: string;
  type: ResourceType;
  serverId: string;
  environmentVariables?: EnvironmentVariable[];
  // Database specific fields
  databaseType?: DatabaseType;
  databaseName?: string;
  adminEmail?: string;
  initialDatabase?: string;
  dbPassword?: string;
  // Service specific fields
  serviceType?: ServiceType;
  repositoryUrl?: string;
  dockerComposeContent?: string;
  dockerImageUrl?: string;
  // Website specific fields
  branch?: string;
}

export interface CreateEnvironmentDto {
  name: string;
  variables: EnvironmentVariable[];
} 