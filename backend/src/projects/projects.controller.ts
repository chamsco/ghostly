import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { Project, ProjectStatus } from './entities/project.entity';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async getAllProjects(@Req() req: RequestWithUser): Promise<Project[]> {
    try {
      return await this.projectsService.findAllByUser(req.user.id);
    } catch (error) {
      if (error.code === '42P01') {
        throw new InternalServerErrorException('Database setup incomplete');
      }
      throw new InternalServerErrorException('Failed to fetch projects');
    }
  }

  @Get(':id')
  async getProject(@Param('id') id: string, @Req() req: RequestWithUser): Promise<Project> {
    try {
      const project = await this.projectsService.findOne(id);
      if (!project || project.ownerId !== req.user.id) {
        throw new UnauthorizedException('Project not found');
      }
      return project;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch project');
    }
  }

  @Post()
  async createProject(
    @Body() projectData: {
      name: string;
      description?: string;
      status?: ProjectStatus;
    },
    @Req() req: RequestWithUser
  ): Promise<Project> {
    try {
      return await this.projectsService.create({
        ...projectData,
        ownerId: req.user.id
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  @Put(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() projectData: Partial<Project>,
    @Req() req: RequestWithUser
  ): Promise<Project> {
    try {
      const project = await this.projectsService.findOne(id);
      if (!project || project.ownerId !== req.user.id) {
        throw new UnauthorizedException('Project not found');
      }
      return await this.projectsService.update(id, projectData);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update project');
    }
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string, @Req() req: RequestWithUser): Promise<void> {
    try {
      const project = await this.projectsService.findOne(id);
      if (!project || project.ownerId !== req.user.id) {
        throw new UnauthorizedException('Project not found');
      }
      await this.projectsService.delete(id);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete project');
    }
  }

  @Get('stats')
  async getProjectStats(@Req() req: RequestWithUser) {
    try {
      return await this.projectsService.getProjectStats(req.user.id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch project stats');
    }
  }
} 