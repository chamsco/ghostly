import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Project } from './entities/project.entity';
import { Resource } from './entities/resource.entity';
import { Environment } from './entities/environment.entity';
import { EnvironmentVariable } from './entities/environment-variable.entity';
import { EnvTemplate } from './entities/env-template.entity';
import { ProjectsService } from './projects.service';
import { EnvTemplateService } from './services/env-template.service';
import { EnvironmentsService } from './services/environments.service';
import { ProjectsController } from './projects.controller';
import { EnvironmentsController } from './controllers/environments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Resource,
      Environment,
      EnvironmentVariable,
      EnvTemplate
    ]),
    MulterModule.register({
      limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
      }
    })
  ],
  controllers: [
    ProjectsController,
    EnvironmentsController
  ],
  providers: [
    ProjectsService,
    EnvironmentsService,
    EnvTemplateService
  ],
  exports: [
    ProjectsService,
    EnvironmentsService,
    EnvTemplateService
  ]
})
export class ProjectsModule {} 