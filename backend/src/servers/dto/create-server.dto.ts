import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, ValidateIf, IsEnum } from 'class-validator';
import { ProjectType } from '../../projects/types/project.types';

export class CreateServerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  host: string;

  @IsNumber()
  @IsOptional()
  port: number = 22;

  @IsString()
  @IsNotEmpty()
  username: string = 'root';

  @IsString()
  @IsNotEmpty()
  privateKey: string;

  @IsBoolean()
  @IsOptional()
  isBuildServer?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isSwarmManager?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isSwarmWorker?: boolean = false;

  @IsEnum(ProjectType, { each: true })
  @IsOptional()
  supportedTypes?: ProjectType[] = [];
} 