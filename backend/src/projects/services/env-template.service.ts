 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnvTemplate } from '../entities/env-template.entity';
import { CreateEnvTemplateDto, UpdateEnvTemplateDto } from '../dto/env-template.dto';
import { ProjectType } from '../types/project.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EnvTemplateService {
  private readonly defaultTemplates: Record<ProjectType, { variables: { key: string; value: string; isSecret: boolean; description: string; }[] }> = {
    [ProjectType.NODE]: {
      variables: [
        { key: 'NODE_ENV', value: 'development', isSecret: false, description: 'Node.js environment' },
        { key: 'PORT', value: '3000', isSecret: false, description: 'Application port' },
        { key: 'DATABASE_URL', value: '', isSecret: true, description: 'Database connection string' }
      ]
    },
    [ProjectType.PYTHON]: {
      variables: [
        { key: 'FLASK_ENV', value: 'development', isSecret: false, description: 'Flask environment' },
        { key: 'FLASK_APP', value: 'app.py', isSecret: false, description: 'Application entry point' },
        { key: 'DATABASE_URL', value: '', isSecret: true, description: 'Database connection string' }
      ]
    },
    [ProjectType.DOCKER]: {
      variables: [
        { key: 'DOCKER_HOST', value: '', isSecret: false, description: 'Docker host URL' },
        { key: 'DOCKER_REGISTRY', value: '', isSecret: false, description: 'Docker registry URL' }
      ]
    },
    [ProjectType.OTHER]: {
      variables: [
        { key: 'APP_ENV', value: 'development', isSecret: false, description: 'Application environment' }
      ]
    }
  };

  constructor(
    @InjectRepository(EnvTemplate)
    private envTemplateRepository: Repository<EnvTemplate>,
  ) {}

  async create(createEnvTemplateDto: CreateEnvTemplateDto): Promise<EnvTemplate> {
    const template = this.envTemplateRepository.create(createEnvTemplateDto);
    return await this.envTemplateRepository.save(template);
  }

  async findAll(): Promise<EnvTemplate[]> {
    return await this.envTemplateRepository.find();
  }

  async findOne(id: string): Promise<EnvTemplate> {
    return await this.envTemplateRepository.findOneOrFail({ where: { id } });
  }

  async update(id: string, updateEnvTemplateDto: UpdateEnvTemplateDto): Promise<EnvTemplate> {
    await this.envTemplateRepository.update(id, updateEnvTemplateDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.envTemplateRepository.delete(id);
  }

  getTemplate(projectType: ProjectType): { variables: { key: string; value: string; isSecret: boolean; description: string; }[] } {
    return this.defaultTemplates[projectType] || this.defaultTemplates[ProjectType.OTHER];
  }

  parseEnvFile(content: string): { key: string; value: string; isSecret: boolean; }[] {
    const lines = content.split('\n');
    const variables: { key: string; value: string; isSecret: boolean; }[] = [];
    const secretKeywords = ['secret', 'password', 'token', 'key', 'auth', 'credential', 'private'];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=');
        if (key) {
          const isSecret = secretKeywords.some(keyword => 
            key.toLowerCase().includes(keyword.toLowerCase())
          );
          variables.push({
            key: key.trim(),
            value: value ? value.trim() : '',
            isSecret
          });
        }
      }
    }

    return variables;
  }
}