import { IsString, IsNotEmpty, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EnvironmentType } from '../types/project.types';
import { EnvironmentVariableDto } from './environment-variable.dto';

export class CreateEnvironmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(EnvironmentType)
  type: EnvironmentType;

  @ValidateNested({ each: true })
  @Type(() => EnvironmentVariableDto)
  variables: EnvironmentVariableDto[];
} 