import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ResourcesService } from '../services/resources.service';
import { Resource } from '../../resources/entities/resource.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';

@Controller('resources')
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post(':projectId')
  async create(
    @Req() req: RequestWithUser,
    @Param('projectId') projectId: string,
    @Body() createResourceDto: any
  ): Promise<Resource> {
    return await this.resourcesService.create(req.user, createResourceDto);
  }

  @Get(':projectId')
  async findByProject(
    @Req() req: RequestWithUser,
    @Param('projectId') projectId: string
  ): Promise<Resource[]> {
    return await this.resourcesService.findAllByProject(req.user, projectId);
  }

  @Get(':projectId/:id')
  async findOne(
    @Req() req: RequestWithUser,
    @Param('projectId') projectId: string,
    @Param('id') id: string
  ): Promise<Resource> {
    return await this.resourcesService.findOne(req.user, projectId, id);
  }

  @Delete(':projectId/:id')
  async remove(
    @Req() req: RequestWithUser,
    @Param('projectId') projectId: string,
    @Param('id') id: string
  ): Promise<void> {
    return await this.resourcesService.remove(req.user, projectId, id);
  }
} 