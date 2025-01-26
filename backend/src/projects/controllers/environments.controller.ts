import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EnvironmentsService } from '../services/environments.service';
import { Environment } from '../entities/environment.entity';
import { EnvironmentVariable } from '../entities/environment-variable.entity';
import { CreateEnvironmentDto, UpdateEnvironmentDto, CreateEnvironmentVariableDto } from '../dto/environment.dto';

@Controller('environments')
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Post()
  async create(@Body() createEnvironmentDto: CreateEnvironmentDto): Promise<Environment> {
    return await this.environmentsService.create(createEnvironmentDto);
  }

  @Get()
  async findAll(): Promise<Environment[]> {
    return await this.environmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Environment> {
    return await this.environmentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEnvironmentDto: UpdateEnvironmentDto
  ): Promise<Environment> {
    return await this.environmentsService.update(id, updateEnvironmentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.environmentsService.remove(id);
  }

  @Post(':id/variables')
  async addVariable(
    @Param('id') id: string,
    @Body() createVariableDto: CreateEnvironmentVariableDto
  ): Promise<EnvironmentVariable> {
    return await this.environmentsService.addVariable(id, createVariableDto);
  }

  @Delete(':environmentId/variables/:variableId')
  async removeVariable(
    @Param('variableId') variableId: string
  ): Promise<void> {
    return await this.environmentsService.removeVariable(variableId);
  }
} 