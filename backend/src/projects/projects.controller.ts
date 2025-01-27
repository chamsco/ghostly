import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Req, UnauthorizedException, ConflictException, InternalServerErrorException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { ProjectStatus, ProjectType } from './types/project.types';
import { Resource } from './entities/resource.entity';
import { Environment } from './entities/environment.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateResourceDto } from './dto/create-resource.dto';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { CreateEnvTemplateDto } from './dto/env-template.dto';
import { EnvTemplateService } from './services';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly envTemplateService: EnvTemplateService
  ) {}

  @Get()
  async getAllProjects(@Req() req: RequestWithUser): Promise<Project[]> {
    try {
      const projects = await this.projectsService.findAllByUser(req.user.id);
      return projects || [];
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      if (error.code === '42P01') {
        throw new InternalServerErrorException('Database setup incomplete');
      }
      if (error instanceof InternalServerErrorException) {
        throw error;
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
  @UseGuards(JwtAuthGuard)
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: RequestWithUser
  ): Promise<Project> {
    try {
      return await this.projectsService.createProject(createProjectDto, req.user.id);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  @Patch(':id')
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

  // Resource endpoints
  @Post(':id/resources')
  async createResource(
    @Param('id') projectId: string,
    @Body() resourceData: CreateResourceDto,
    @Req() req: RequestWithUser
  ): Promise<Resource> {
    try {
      const project = await this.projectsService.findOne(projectId);
      if (!project || project.ownerId !== req.user.id) {
        throw new UnauthorizedException('Project not found');
      }
      return await this.projectsService.createResource(projectId, resourceData);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create resource');
    }
  }

  @Get(':id/resources')
  async getResources(@Param('id') projectId: string, @Req() req: RequestWithUser): Promise<Resource[]> {
    try {
      const project = await this.projectsService.findOne(projectId);
      if (!project || project.ownerId !== req.user.id) {
        throw new UnauthorizedException('Project not found');
      }
      return await this.projectsService.findResourcesByProject(projectId);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch resources');
    }
  }

  @Patch('resources/:id')
  async updateResource(
    @Param('id') resourceId: string,
    @Body() resourceData: Partial<Resource>,
    @Req() req: RequestWithUser
  ): Promise<Resource> {
    try {
      const resource = await this.projectsService.findResource(resourceId);
      if (!resource || resource.project.ownerId !== req.user.id) {
        throw new UnauthorizedException('Resource not found');
      }
      return await this.projectsService.updateResource(resourceId, resourceData);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update resource');
    }
  }

  @Delete('resources/:id')
  async deleteResource(@Param('id') resourceId: string, @Req() req: RequestWithUser): Promise<void> {
    try {
      const resource = await this.projectsService.findResource(resourceId);
      if (!resource || resource.project.ownerId !== req.user.id) {
        throw new UnauthorizedException('Resource not found');
      }
      await this.projectsService.deleteResource(resourceId);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete resource');
    }
  }

  // Environment endpoints
  @Post(':id/environments')
  async createEnvironment(
    @Param('id') projectId: string,
    @Body() environmentData: CreateEnvironmentDto,
    @Req() req: RequestWithUser
  ): Promise<Environment> {
    try {
      const project = await this.projectsService.findOne(projectId);
      if (!project || project.ownerId !== req.user.id) {
        throw new UnauthorizedException('Project not found');
      }
      return await this.projectsService.createEnvironment(projectId, environmentData);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create environment');
    }
  }

  @Get(':id/environments')
  async getEnvironments(@Param('id') projectId: string, @Req() req: RequestWithUser): Promise<Environment[]> {
    try {
      const project = await this.projectsService.findOne(projectId);
      if (!project || project.ownerId !== req.user.id) {
        throw new UnauthorizedException('Project not found');
      }
      return await this.projectsService.findEnvironmentsByProject(projectId);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch environments');
    }
  }

  @Patch('environments/:id')
  async updateEnvironment(
    @Param('id') environmentId: string,
    @Body() environmentData: Partial<Environment>,
    @Req() req: RequestWithUser
  ): Promise<Environment> {
    try {
      const environment = await this.projectsService.findEnvironment(environmentId);
      if (!environment || environment.project.ownerId !== req.user.id) {
        throw new UnauthorizedException('Environment not found');
      }
      return await this.projectsService.updateEnvironment(environmentId, environmentData);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update environment');
    }
  }

  @Delete('environments/:id')
  async deleteEnvironment(@Param('id') environmentId: string, @Req() req: RequestWithUser): Promise<void> {
    try {
      const environment = await this.projectsService.findEnvironment(environmentId);
      if (!environment || environment.project.ownerId !== req.user.id) {
        throw new UnauthorizedException('Environment not found');
      }
      await this.projectsService.deleteEnvironment(environmentId);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete environment');
    }
  }

  @Post('env-templates')
  async getEnvTemplate(@Body() request: CreateEnvTemplateDto): Promise<{ variables: { key: string; value: string; isSecret: boolean; description: string; }[] }> {
    try {
      return this.envTemplateService.getTemplate(request.projectType);
    } catch (error) {
      throw new InternalServerErrorException('Failed to get environment template');
    }
  }

  @Post('env-file')
  @UseInterceptors(FileInterceptor('file'))
  async parseEnvFile(@UploadedFile() file: Express.Multer.File): Promise<{ variables: { key: string; value: string; isSecret: boolean; }[] }> {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }

      const content = file.buffer.toString('utf-8');
      const variables = this.envTemplateService.parseEnvFile(content);

      return { variables };
    } catch (error) {
      throw new InternalServerErrorException('Failed to parse environment file');
    }
  }
} 