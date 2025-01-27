import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEnvironmentDto } from './create-environment.dto';
import { EnvironmentVariableDto } from './environment-variable.dto';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  defaultServerId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnvironmentVariableDto)
  @IsOptional()
  globalVariables?: EnvironmentVariableDto[] = [];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEnvironmentDto)
  @IsOptional()
  environments?: CreateEnvironmentDto[] = [];
} 