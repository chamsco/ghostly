import { IsString, IsNotEmpty, IsNumber, Min, Max, IsBoolean, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectType } from '../../projects/types/project.types';
import { ServerType } from '../types/server.types';

export class PortMappingDto {
  @ApiProperty({ description: 'Container port number', example: 3000 })
  @IsNumber()
  @Min(1)
  @Max(65535)
  containerPort: number;

  @ApiProperty({ description: 'Host port number', example: 3000 })
  @IsNumber()
  @Min(1)
  @Max(65535)
  hostPort: number;

  @ApiProperty({ description: 'Protocol (tcp/udp)', example: 'tcp', enum: ['tcp', 'udp'] })
  @IsString()
  @IsNotEmpty()
  protocol: 'tcp' | 'udp';
}

export class CreateServerDto {
  @ApiProperty({ description: 'Server name', example: 'production-1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Server host (IP or hostname)', example: '192.168.1.100' })
  @IsString()
  @IsNotEmpty()
  host: string;

  @ApiProperty({ description: 'SSH port number', example: 22, default: 22 })
  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number;

  @ApiProperty({ description: 'SSH username', example: 'root', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ description: 'SSH private key content', required: false })
  @IsString()
  @IsOptional()
  privateKey?: string;

  @ApiProperty({ description: 'Server type', enum: ServerType, example: ServerType.REMOTE })
  @IsEnum(ServerType)
  @IsOptional()
  type?: ServerType;

  @ApiProperty({ description: 'Whether server is a Swarm manager', default: false })
  @IsBoolean()
  @IsOptional()
  isSwarmManager?: boolean;

  @ApiProperty({ description: 'Whether server is a Swarm worker', default: false })
  @IsBoolean()
  @IsOptional()
  isSwarmWorker?: boolean;

  @ApiProperty({ description: 'Whether server is a build server', default: false })
  @IsBoolean()
  @IsOptional()
  isBuildServer?: boolean;

  @ApiProperty({ description: 'Domain name for the server', required: false, example: 'app.example.com' })
  @IsString()
  @IsOptional()
  domainName?: string;

  @ApiProperty({ description: 'Port mappings for containers', type: [PortMappingDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PortMappingDto)
  portMappings?: PortMappingDto[];

  @ApiProperty({ description: 'Docker labels for the server', required: false })
  @IsOptional()
  labels?: Record<string, string>;

  @ApiProperty({ description: 'Supported project types', type: [String], enum: ProjectType, isArray: true })
  @IsEnum(ProjectType, { each: true })
  @IsOptional()
  supportedTypes?: ProjectType[] = [];
} 