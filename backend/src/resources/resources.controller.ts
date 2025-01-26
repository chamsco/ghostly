import { 
  Controller, 
  Get, 
  Post, 
  Delete,
  Body, 
  Param,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourcesService } from '../projects/services/resources.service';
import { CreateResourceDto } from '../projects/dto/create-resource.dto';
import { Resource } from './entities/resource.entity';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { User } from '../users/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ProjectStatus } from '../projects/types/project.types';

@Controller('projects/:projectId/resources')
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  create(
    @GetUser() user: User,
    @Param('projectId') projectId: string,
    @Body() createResourceDto: CreateResourceDto
  ): Promise<Resource> {
    return this.resourcesService.create(user, {
      ...createResourceDto,
      projectId,
    });
  }

  @Get()
  findAll(
    @GetUser() user: User,
    @Param('projectId') projectId: string
  ): Promise<Resource[]> {
    return this.resourcesService.findAllByProject(user, projectId);
  }

  @Get(':id')
  findOne(
    @GetUser() user: User,
    @Param('projectId') projectId: string,
    @Param('id') id: string
  ): Promise<Resource> {
    return this.resourcesService.findOne(user, projectId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @GetUser() user: User,
    @Param('projectId') projectId: string,
    @Param('id') id: string
  ): Promise<void> {
    return this.resourcesService.remove(user, projectId, id);
  }

  @Post(':id/deploy')
  deploy(
    @GetUser() user: User,
    @Param('projectId') projectId: string,
    @Param('id') id: string
  ): Promise<Resource> {
    return this.resourcesService.deploy(user, projectId, id);
  }

  @Post(':id/stop')
  stop(
    @GetUser() user: User,
    @Param('projectId') projectId: string,
    @Param('id') id: string
  ): Promise<Resource> {
    return this.resourcesService.stop(user, projectId, id);
  }

  @Get(':id/status')
  async getStatus(
    @GetUser() user: User,
    @Param('projectId') projectId: string,
    @Param('id') id: string
  ): Promise<{ status: ProjectStatus }> {
    const status = await this.resourcesService.getStatus(user, projectId, id);
    return { status };
  }

  @Get(':id/logs')
  getLogs(
    @GetUser() user: User,
    @Param('projectId') projectId: string,
    @Param('id') id: string
  ): Promise<string> {
    return this.resourcesService.getLogs(user, projectId, id);
  }
} 