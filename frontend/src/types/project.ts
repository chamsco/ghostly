/**
 * Project Types
 * 
 * Defines types and interfaces for projects in the application:
 * - Project: Main project interface with all properties
 * - ProjectType: Enum of supported project types
 * - ProjectStatus: Enum of possible project statuses
 * - CreateProjectDto: Data required to create a new project
 */

export enum ProjectType {
  SUPABASE = 'supabase',
  POCKETBASE = 'pocketbase',
  WEBSITE = 'website',
  SERVICE = 'service'
}

export enum ProjectStatus {
  CREATED = 'created',
  DEPLOYING = 'deploying',
  RUNNING = 'running',
  STOPPED = 'stopped',
  FAILED = 'failed'
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  serverId: string;
  status: ProjectStatus;
  error?: string;
  dockerComposeFile?: string;
  environmentVariables?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  type: ProjectType;
  serverId: string;
  dockerComposeFile?: string;
  environmentVariables?: Record<string, string>;
} 