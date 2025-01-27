import { Resource, EnvironmentType } from './project';

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  created_at: string;
  updated_at: string;
}

export interface Environment {
  id: string;
  name: string;
  type: EnvironmentType;
  projectId: string;
  resources: Resource[];
  variables: EnvironmentVariable[];
  created_at: string;
  updated_at: string;
}

export interface CreateEnvironmentDto {
  name: string;
  type: EnvironmentType;
  variables?: EnvironmentVariable[];
} 