import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Resource } from '../resources/entities/resource.entity';
import { User } from '../users/entities/user.entity';
import { DashboardStats } from './types/dashboard.types';
import { ProjectStatus } from '../projects/types/project.types';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Resource)
    private resourcesRepository: Repository<Resource>,
  ) {}

  async getDashboardStats(user: User): Promise<DashboardStats> {
    const [
      totalProjects,
      runningProjects,
      totalResources,
      runningResources,
    ] = await Promise.all([
      this.projectsRepository.count({
        where: { ownerId: user.id }
      }),
      this.projectsRepository.count({
        where: {
          ownerId: user.id,
          status: ProjectStatus.RUNNING
        }
      }),
      this.resourcesRepository.count({
        where: {
          project: {
            ownerId: user.id
          }
        }
      }),
      this.resourcesRepository.count({
        where: {
          project: {
            ownerId: user.id
          },
          status: ProjectStatus.RUNNING
        }
      })
    ]);

    return {
      totalProjects,
      runningProjects,
      totalResources,
      runningResources
    };
  }
} 