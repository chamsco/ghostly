import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Environment } from '../entities/environment.entity';
import { EnvironmentVariable } from '../entities/environment-variable.entity';
import { CreateEnvironmentDto, UpdateEnvironmentDto, CreateEnvironmentVariableDto } from '../dto/environment.dto';

@Injectable()
export class EnvironmentsService {
  constructor(
    @InjectRepository(Environment)
    private environmentRepository: Repository<Environment>,
    @InjectRepository(EnvironmentVariable)
    private environmentVariableRepository: Repository<EnvironmentVariable>,
  ) {}

  async create(createEnvironmentDto: CreateEnvironmentDto): Promise<Environment> {
    const environment = this.environmentRepository.create({
      ...createEnvironmentDto,
      project: { id: createEnvironmentDto.projectId }
    });
    return await this.environmentRepository.save(environment);
  }

  async findAll(): Promise<Environment[]> {
    return await this.environmentRepository.find({
      relations: ['variables', 'project']
    });
  }

  async findOne(id: string): Promise<Environment> {
    return await this.environmentRepository.findOneOrFail({
      where: { id },
      relations: ['variables', 'project']
    });
  }

  async update(id: string, updateEnvironmentDto: UpdateEnvironmentDto): Promise<Environment> {
    await this.environmentRepository.update(id, updateEnvironmentDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.environmentRepository.delete(id);
  }

  async addVariable(environmentId: string, createVariableDto: CreateEnvironmentVariableDto): Promise<EnvironmentVariable> {
    const variable = this.environmentVariableRepository.create({
      ...createVariableDto,
      environment: { id: environmentId }
    });
    return await this.environmentVariableRepository.save(variable);
  }

  async removeVariable(variableId: string): Promise<void> {
    await this.environmentVariableRepository.delete(variableId);
  }
} 