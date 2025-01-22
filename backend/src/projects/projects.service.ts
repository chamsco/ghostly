import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { Resource } from './entities/resource.entity';
import { Environment } from './entities/environment.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { ProjectStatus } from './types/project.types';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Resource)
    private resourcesRepository: Repository<Resource>,
    @InjectRepository(Environment)
    private environmentsRepository: Repository<Environment>
  ) {}

  // Project methods
  async findAllByUser(userId: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { ownerId: userId },
      order: { createdAt: 'DESC' },
      relations: ['resources', 'environments']
    });
  }

  async findOne(id: string): Promise<Project | null> {
    return this.projectsRepository.findOne({
      where: { id },
      relations: ['resources', 'environments']
    });
  }

  async create(projectData: {
    name: string;
    description?: string;
    status?: ProjectStatus;
    ownerId: string;
  }): Promise<Project> {
    try {
      const project = this.projectsRepository.create({
        ...projectData,
        status: projectData.status || ProjectStatus.CREATED,
        resources: [],
        environments: []
      });

      return await this.projectsRepository.save(project);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  async update(id: string, projectData: Partial<Project>): Promise<Project> {
    try {
      await this.projectsRepository.update(id, projectData);
      const updatedProject = await this.projectsRepository.findOne({
        where: { id },
        relations: ['resources', 'environments']
      });

      if (!updatedProject) {
        throw new NotFoundException('Project not found');
      }

      return updatedProject;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update project');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.projectsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Project not found');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete project');
    }
  }

  // Resource methods
  async createResource(projectId: string, resourceData: CreateResourceDto): Promise<Resource> {
    const project = await this.findOne(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    try {
      const resource = this.resourcesRepository.create({
        ...resourceData,
        project,
        status: ProjectStatus.CREATED
      });

      return await this.resourcesRepository.save(resource);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create resource');
    }
  }

  async findResourcesByProject(projectId: string): Promise<Resource[]> {
    const project = await this.findOne(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project.resources;
  }

  async findResource(resourceId: string): Promise<Resource> {
    const resource = await this.resourcesRepository.findOne({
      where: { id: resourceId },
      relations: ['project']
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return resource;
  }

  async updateResource(resourceId: string, resourceData: Partial<Resource>): Promise<Resource> {
    const resource = await this.findResource(resourceId);

    try {
      await this.resourcesRepository.update(resourceId, resourceData);
      return await this.findResource(resourceId);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update resource');
    }
  }

  async deleteResource(resourceId: string): Promise<void> {
    const resource = await this.findResource(resourceId);

    try {
      await this.resourcesRepository.remove(resource);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete resource');
    }
  }

  // Environment methods
  async createEnvironment(projectId: string, environmentData: CreateEnvironmentDto): Promise<Environment> {
    const project = await this.findOne(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    try {
      const environment = this.environmentsRepository.create({
        ...environmentData,
        project
      });

      return await this.environmentsRepository.save(environment);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create environment');
    }
  }

  async findEnvironmentsByProject(projectId: string): Promise<Environment[]> {
    const project = await this.findOne(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project.environments;
  }

  async findEnvironment(environmentId: string): Promise<Environment> {
    const environment = await this.environmentsRepository.findOne({
      where: { id: environmentId },
      relations: ['project']
    });

    if (!environment) {
      throw new NotFoundException('Environment not found');
    }

    return environment;
  }

  async updateEnvironment(environmentId: string, environmentData: Partial<Environment>): Promise<Environment> {
    const environment = await this.findEnvironment(environmentId);

    try {
      await this.environmentsRepository.update(environmentId, environmentData);
      return await this.findEnvironment(environmentId);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update environment');
    }
  }

  async deleteEnvironment(environmentId: string): Promise<void> {
    const environment = await this.findEnvironment(environmentId);

    try {
      await this.environmentsRepository.remove(environment);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete environment');
    }
  }

  // Project stats
  async getProjectStats(userId: string) {
    const [projects, activeCount] = await Promise.all([
      this.projectsRepository.find({
        where: { ownerId: userId },
        relations: ['resources']
      }),
      this.projectsRepository.count({
        where: { 
          ownerId: userId,
          status: ProjectStatus.RUNNING
        }
      })
    ]);

    return {
      totalProjects: projects.length,
      activeDeployments: activeCount,
      totalResources: projects.reduce((acc, project) => acc + project.resources.length, 0)
    };
  }
} 