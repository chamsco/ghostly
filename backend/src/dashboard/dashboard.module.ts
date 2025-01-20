import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [DashboardController],
})
export class DashboardModule {} 