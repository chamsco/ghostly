import { Controller, Get, UseGuards, Req, InternalServerErrorException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getDashboardStats(@Req() req: RequestWithUser) {
    try {
      return await this.dashboardService.getDashboardStats(req.user);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw new InternalServerErrorException('Failed to fetch dashboard statistics');
    }
  }
} 