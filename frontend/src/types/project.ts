/**
 * Project Types
 * 
 * Defines types and interfaces for projects in the application:
 * - Project: Main project interface with all properties
 * - ProjectType: Enum of supported project types
 * - DatabaseType: Enum of supported database types
 * - ServiceType: Enum of supported service types
 * - ProjectStatus: Enum of possible project statuses
 * - CreateProjectDto: Data required to create a new project
 */

export enum ProjectType {
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
  DOCKER = 'docker'
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

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  serverId: string;
  status: ProjectStatus;
  error?: string;
  // Database specific fields
  databaseType?: DatabaseType;
  databaseName?: string;
  adminEmail?: string;
  // Service specific fields
  serviceType?: ServiceType;
  repositoryUrl?: string;
  // Website specific fields
  branch?: string;
  // Common fields
  environmentVariables?: EnvironmentVariable[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  type: ProjectType;
  serverId: string;
  // Database specific fields
  databaseType?: DatabaseType;
  databaseName?: string;
  adminEmail?: string;
  // Service specific fields
  serviceType?: ServiceType;
  repositoryUrl?: string;
  // Website specific fields
  branch?: string;
  // Common fields
  environmentVariables?: EnvironmentVariable[];
} 