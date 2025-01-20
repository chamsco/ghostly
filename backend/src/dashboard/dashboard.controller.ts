import { Controller, Get, UseGuards, Req, InternalServerErrorException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getDashboardStats(@Req() req: RequestWithUser) {
    try {
      return await this.projectsService.getProjectStats(req.user.id);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw new InternalServerErrorException('Failed to fetch dashboard statistics');
    }
  }
} 