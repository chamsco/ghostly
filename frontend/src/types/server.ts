/**
 * Server Types
 * 
 * Defines types and interfaces for servers in the application
 */

//aimport { ProjectType } from './project';

export interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  status: 'online' | 'offline';
  isBuildServer: boolean;
  isSwarmManager: boolean;
  isSwarmWorker: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServerDto {
  name: string;
  host: string;
  port: number;
  username: string;
  privateKey: string;
  isBuildServer: boolean;
  isSwarmManager: boolean;
  isSwarmWorker: boolean;
} 