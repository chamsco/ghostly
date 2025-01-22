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
  variables: EnvironmentVariable[];
  resources: string[];
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnvironmentDto {
  name: string;
  variables: EnvironmentVariable[];
  resources?: string[];
} 