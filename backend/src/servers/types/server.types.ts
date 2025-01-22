/**
 * Server Types Module
 * 
 * Defines types and enums for server configuration and management
 */

export enum ServerType {
  LOCAL = 'local',
  REMOTE = 'remote'
}

export interface PortMapping {
  containerPort: number;
  hostPort: number;
  protocol: 'tcp' | 'udp';
}

export interface ServerConfig {
  name: string;
  host: string;
  port: number;
  username?: string;
  privateKey?: string;
  type: ServerType;
  isSwarmManager: boolean;
  isSwarmWorker: boolean;
  isBuildServer: boolean;
  domainName?: string;
  portMappings?: PortMapping[];
  labels?: Record<string, string>;
}

export interface ServerStatus {
  isConnected: boolean;
  lastChecked: string;
  error?: string;
}

export interface ServerMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  containersRunning: number;
  lastUpdated: string;
} 