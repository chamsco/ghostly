import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('system')
  async getSystemMetrics() {
    return this.metricsService.getSystemMetrics();
  }

  @UseGuards(JwtAuthGuard)
  @Get('historical')
  async getHistoricalMetrics(@Query('timeRange') timeRange: string) {
    return this.metricsService.getHistoricalMetrics(timeRange);
  }
} 