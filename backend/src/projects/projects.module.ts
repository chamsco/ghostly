import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Resource } from './entities/resource.entity';
import { Environment } from './entities/environment.entity';
import { EnvironmentVariable } from './entities/environment-variable.entity';
import { EnvTemplateService } from './services/env-template.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Resource, Environment, EnvironmentVariable]),
    MulterModule.register({
      limits: {
        fileSize: 1024 * 1024 // 1MB
      }
    })
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, EnvTemplateService],
  exports: [ProjectsService]
})
export class ProjectsModule {} 