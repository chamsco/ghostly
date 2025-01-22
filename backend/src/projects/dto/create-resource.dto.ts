import { IsString, IsNotEmpty, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceType, DatabaseType, ServiceType } from '../types/project.types';
import { EnvironmentVariableDto } from './environment-variable.dto';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ResourceType)
  type: ResourceType;

  @IsString()
  @IsNotEmpty()
  serverId: string;

  @IsString()
  @IsNotEmpty()
  environmentId: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EnvironmentVariableDto)
  environmentVariables?: EnvironmentVariableDto[];

  // Database specific fields
  @IsOptional()
  @IsEnum(DatabaseType)
  databaseType?: DatabaseType;

  @IsOptional()
  @IsString()
  databaseName?: string;

  @IsOptional()
  @IsString()
  adminEmail?: string;

  @IsOptional()
  @IsString()
  initialDatabase?: string;

  @IsOptional()
  @IsString()
  dbPassword?: string;

  // Service specific fields
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @IsOptional()
  @IsString()
  repositoryUrl?: string;

  @IsOptional()
  @IsString()
  dockerComposeContent?: string;

  @IsOptional()
  @IsString()
  dockerImageUrl?: string;

  // Website specific fields
  @IsOptional()
  @IsString()
  branch?: string;
} 