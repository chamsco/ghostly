import { IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EnvironmentVariableDto } from './environment-variable.dto';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  serverId: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EnvironmentVariableDto)
  environmentVariables?: EnvironmentVariableDto[];
} 