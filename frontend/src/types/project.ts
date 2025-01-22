/**
 * Project and Resource Types
 * 
 * Defines types and interfaces for projects and their resources in the application
 */

import type { EnvironmentVariable, Environment } from './environment';

// Re-export for backward compatibility
export type { EnvironmentVariable, Environment };

export enum ProjectType {
  NODEJS = 'nodejs',
  PYTHON = 'python',
  PHP = 'php',
  DOCKER = 'docker',
  DATABASE = 'database',
  WEBSITE = 'website'
}

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
  RUNNING = 'running',
  STOPPED = 'stopped',
  ERROR = 'error'
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
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  ownerId: string;
  serverId?: string;
  resources: string[]; // Resource IDs
  environments: Environment[];
  environmentVariables?: EnvironmentVariable[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  type?: string;
  serverId?: string;
  environments: CreateEnvironmentDto[];
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
  resources: Resource[];
} 