/**
 * Project and Resource Types
 * 
 * Defines types and interfaces for projects and their resources in the application
 */

import { EnvironmentVariable } from './environment';

export enum ProjectStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

export enum ResourceType {
  DATABASE = 'database',
  SERVICE = 'service',
  WEBSITE = 'website'
}

export enum DatabaseType {
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb'
}

export enum ServiceType {
  NODEJS = 'nodejs',
  PYTHON = 'python',
  PHP = 'php',
  DOCKER = 'docker',
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb',
  REDIS = 'redis'
}

export enum EnvironmentType {
  DEV = 'dev',
  PROD = 'prod',
  STAGING = 'staging',
  TEST = 'test'
}

export interface Resource {
  id: string;
  name: string;
  type: ServiceType;
  serverId: string;
  status: ProjectStatus;
  error?: string;
  url?: string;
  environmentId: string;
  projectId: string;
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

export interface Environment {
  id: string;
  name: string;
  type: EnvironmentType;
  projectId: string;
  resources: Resource[];
  variables: EnvironmentVariable[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  serverId?: string;
  ownerId: string;
  status: ProjectStatus;
  resources: Resource[];
  environments: Environment[];
  environmentVariables?: EnvironmentVariable[];
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentVariableDto {
  key: string;
  value: string;
  isSecret: boolean;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  defaultServerId?: string;
  globalVariables: EnvironmentVariableDto[];
  environments: CreateEnvironmentDto[];
}

export interface CreateEnvironmentDto {
  name: string;
  type: EnvironmentType;
  variables?: EnvironmentVariableDto[];
}

export interface CreateResourceDto {
  name: string;
  type: ServiceType;
  serverId: string;
  environmentId: string;
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