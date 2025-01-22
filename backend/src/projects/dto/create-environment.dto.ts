import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EnvironmentVariableDto } from './environment-variable.dto';

export class CreateEnvironmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateNested({ each: true })
  @Type(() => EnvironmentVariableDto)
  variables: EnvironmentVariableDto[];
} 