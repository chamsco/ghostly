/**
 * Server Types
 * 
 * Defines types and interfaces for servers in the application
 */

export interface Server {
  id: string;
  name: string;
  type: 'local' | 'remote';
  host?: string;
  sshConfig?: {
    username: string;
    privateKey: string;
    port: number;
  };
  status: 'online' | 'offline';
  createdAt: string;
  updatedAt: string;
} 