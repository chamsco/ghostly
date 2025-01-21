import { ProjectType } from './project';

export interface Server {
  id: string;
  name: string;
  supportedTypes: ProjectType[];
  status: 'online' | 'offline' | 'maintenance';
  region: string;
  createdAt: string;
  updatedAt: string;
} 