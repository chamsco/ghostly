import { IsString, IsNotEmpty, IsNumber, Min, Max, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectType } from '../../projects/types/project.types';

export class CreateServerDto {
  @ApiProperty({ description: 'Server name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Server hostname or IP address' })
  @IsString()
  @IsNotEmpty()
  host: string;

  @ApiProperty({ description: 'SSH port', default: 22 })
  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  port: number = 22;

  @ApiProperty({ description: 'SSH username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'SSH private key' })
  @IsString()
  @IsNotEmpty()
  privateKey: string;

  @ApiProperty({ description: 'Whether this is a build server', default: false })
  @IsBoolean()
  @IsOptional()
  isBuildServer: boolean = false;

  @ApiProperty({ description: 'Whether this is a Swarm manager node', default: false })
  @IsBoolean()
  @IsOptional()
  isSwarmManager: boolean = false;

  @ApiProperty({ description: 'Whether this is a Swarm worker node', default: false })
  @IsBoolean()
  @IsOptional()
  isSwarmWorker: boolean = false;

  @ApiProperty({ description: 'Supported project types', type: [String], enum: ProjectType, isArray: true })
  @IsEnum(ProjectType, { each: true })
  @IsOptional()
  supportedTypes?: ProjectType[] = [];
} 