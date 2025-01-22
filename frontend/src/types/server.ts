/**
 * Server Types
 * 
 * Defines types and interfaces for servers in the application
 */

import { ProjectType } from './project';

export interface Server {
  id: string;
  name: string;
  description?: string;
  host: string;
  port: number;
  username: string;
  privateKey: string;
  isBuildServer: boolean;
  isSwarmManager: boolean;
  isSwarmWorker: boolean;
  supportedTypes: ProjectType[];
  status: 'online' | 'offline';
  createdAt: string;
  updatedAt: string;
}

export interface CreateServerDto {
  name: string;
  description?: string;
  host: string;
  port?: number;
  username?: string;
  privateKey: string;
  isBuildServer?: boolean;
  isSwarmManager?: boolean;
  isSwarmWorker?: boolean;
  supportedTypes?: ProjectType[];
} 