import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ProjectType } from '../types/project.types';

export class EnvTemplateRequestDto {
  @IsEnum(ProjectType)
  projectType: ProjectType;
}

export interface EnvTemplateResponseDto {
  variables: {
    key: string;
    value: string;
    isSecret: boolean;
    description: string;
  }[];
} 