export interface EnvironmentVariable {
  key: string;
  value: string;
  isSecret: boolean;
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