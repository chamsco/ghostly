import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from '../../resources/entities/resource.entity';
import { CreateResourceDto } from '../../resources/dto/create-resource.dto';
import { User } from '../../users/entities/user.entity';
import { Project } from '../entities/project.entity';
import { ProjectStatus, ResourceType } from '../types/project.types';
import { DockerService } from './docker.service';
import {
  ResourceNotFoundException,
  ResourceAccessDeniedException,
  ResourceDeploymentException,
  ResourceOperationException,
  InvalidResourceConfigException,
} from '../../common/exceptions/resource.exceptions';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private dockerService: DockerService,
  ) {}

  async create(user: User, createResourceDto: CreateResourceDto): Promise<Resource> {
    const project = await this.projectRepository.findOne({
      where: { id: createResourceDto.projectId },
      relations: ['owner'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.owner.id !== user.id) {
      throw new UnauthorizedException('You do not have access to this project');
    }

    // Validate resource configuration based on type
    this.validateResourceConfig(createResourceDto);

    const resource = this.resourceRepository.create({
      ...createResourceDto,
      status: ProjectStatus.CREATED,
    });

    return this.resourceRepository.save(resource);
  }

  async findAllByProject(user: User, projectId: string): Promise<Resource[]> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['owner', 'resources'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.owner.id !== user.id) {
      throw new UnauthorizedException('You do not have access to this project');
    }

    return project.resources;
  }

  async findOne(user: User, projectId: string, id: string): Promise<Resource> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['owner', 'resources'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.owner.id !== user.id) {
      throw new UnauthorizedException('You do not have access to this project');
    }

    const resource = project.resources.find(r => r.id === id);
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return resource;
  }

  async deploy(user: User, projectId: string, id: string): Promise<Resource> {
    const resource = await this.findOne(user, projectId, id);

    try {
      resource.status = ProjectStatus.DEPLOYING;
      await this.resourceRepository.save(resource);

      const containerId = await this.dockerService.deployResource(resource);
      resource.containerId = containerId;
      resource.status = ProjectStatus.RUNNING;
    } catch (error) {
      resource.status = ProjectStatus.FAILED;
      throw error;
    }

    return this.resourceRepository.save(resource);
  }

  async stop(user: User, projectId: string, id: string): Promise<Resource> {
    const resource = await this.findOne(user, projectId, id);

    try {
      await this.dockerService.stopContainer(resource.containerId);
      resource.status = ProjectStatus.STOPPED;
    } catch (error) {
      resource.status = ProjectStatus.ERROR;
      throw error;
    }

    return this.resourceRepository.save(resource);
  }

  async remove(user: User, projectId: string, id: string): Promise<void> {
    const resource = await this.findOne(user, projectId, id);

    if (resource.status === ProjectStatus.RUNNING) {
      await this.stop(user, projectId, id);
    }

    await this.resourceRepository.remove(resource);
  }

  async getLogs(user: User, projectId: string, id: string): Promise<string> {
    const resource = await this.findOne(user, projectId, id);

    if (!resource.containerId) {
      throw new NotFoundException('Container not found');
    }

    return this.dockerService.getContainerLogs(resource.containerId);
  }

  async getStatus(user: User, projectId: string, id: string): Promise<ProjectStatus> {
    const resource = await this.findOne(user, projectId, id);
    return resource.status;
  }

  private validateResourceConfig(dto: CreateResourceDto): void {
    const { type, config } = dto;

    switch (type) {
      case 'github':
      case 'gitlab':
      case 'bitbucket':
        if (!config.repositoryUrl) {
          throw new InvalidResourceConfigException(
            'Repository URL is required for VCS resources'
          );
        }
        if (!config.branch) {
          throw new InvalidResourceConfigException(
            'Branch is required for VCS resources'
          );
        }
        break;

      case 'service':
        if (!config.port) {
          throw new InvalidResourceConfigException(
            'Port is required for service resources'
          );
        }
        break;

      case 'database':
        // Add database-specific validation
        break;

      case ResourceType.WEBSITE:
        // Add website-specific validation
        break;

      default:
        throw new InvalidResourceConfigException(
          `Invalid resource type: ${type}`
        );
    }
  }
} 