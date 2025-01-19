import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>
  ) {}

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