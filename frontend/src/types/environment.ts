import { Resource, EnvironmentType } from './project';

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
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

export interface CreateEnvironmentDto {
  name: string;
  type: EnvironmentType;
  variables?: EnvironmentVariable[];
} 