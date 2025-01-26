import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ProjectType } from '../types/project.types';

export class CreateEnvTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ProjectType)
  @IsNotEmpty()
  projectType: ProjectType;

  @IsString({ each: true })
  @IsOptional()
  variables?: string[];
}

export class UpdateEnvTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProjectType)
  @IsOptional()
  projectType?: ProjectType;

  @IsString({ each: true })
  @IsOptional()
  variables?: string[];
}

export interface EnvTemplateResponseDto {
  variables: {
    key: string;
    value: string;
    isSecret: boolean;
    description: string;
  }[];
} 