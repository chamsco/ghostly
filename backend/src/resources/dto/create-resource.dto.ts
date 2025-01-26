import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ResourceType } from '../../projects/types/project.types';
import { ResourceConfig } from '../entities/resource.entity';

export class CreateResourceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(ResourceType)
  type: ResourceType;

  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @IsOptional()
  config?: ResourceConfig;
} 