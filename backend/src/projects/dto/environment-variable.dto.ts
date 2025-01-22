import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class EnvironmentVariableDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsBoolean()
  isSecret: boolean;
} 