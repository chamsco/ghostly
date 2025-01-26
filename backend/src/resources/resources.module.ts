import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { DockerService } from './docker.service';
import { Resource } from './entities/resource.entity';
import { Project } from '../projects/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resource, Project])
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService, DockerService],
  exports: [ResourcesService]
})
export class ResourcesModule {} 