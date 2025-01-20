import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>
  ) {}

  async findAllByUser(userId: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { ownerId: userId },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Project | null> {
    return this.projectsRepository.findOne({
      where: { id }
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
        status: projectData.status || ProjectStatus.ACTIVE,
        resourceUsage: {
          cpu: 0,
          memory: 0,
          storage: 0
        }
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
        where: { id }
      });

      if (!updatedProject) {
        throw new UnauthorizedException('Project not found');
      }

      return updatedProject;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update project');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.projectsRepository.delete(id);
      if (result.affected === 0) {
        throw new UnauthorizedException('Project not found');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete project');
    }
  }

  async getProjectStats(userId: string) {
    const [projects, activeCount] = await Promise.all([
      this.projectsRepository.find({
        where: { ownerId: userId },
        select: ['resourceUsage']
      }),
      this.projectsRepository.count({
        where: { 
          ownerId: userId,
          status: ProjectStatus.ACTIVE
        }
      })
    ]);

    // Calculate total resource usage across all projects
    const totalResourceUsage = projects.reduce(
      (acc, project) => ({
        cpu: acc.cpu + (project.resourceUsage?.cpu || 0),
        memory: acc.memory + (project.resourceUsage?.memory || 0),
        storage: acc.storage + (project.resourceUsage?.storage || 0)
      }),
      { cpu: 0, memory: 0, storage: 0 }
    );

    return {
      totalProjects: projects.length,
      activeDeployments: activeCount,
      resourceUsage: totalResourceUsage
    };
  }
} 