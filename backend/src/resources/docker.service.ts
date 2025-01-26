import { Injectable, Logger } from '@nestjs/common';
import { Resource } from './entities/resource.entity';
import Dockerode from 'dockerode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

@Injectable()
export class DockerService {
  private readonly docker: Dockerode;
  private readonly logger = new Logger(DockerService.name);
  private readonly workspaceDir: string;

  constructor() {
    this.docker = new Dockerode();
    this.workspaceDir = path.join(os.tmpdir(), 'squadron-workspace');
    if (!fs.existsSync(this.workspaceDir)) {
      fs.mkdirSync(this.workspaceDir, { recursive: true });
    }
  }

  async deployResource(resource: Resource): Promise<string> {
    this.logger.log(`Deploying resource ${resource.id}`);

    try {
      // Clone repository if needed
      if (resource.repositoryUrl) {
        await this.cloneRepository(resource);
      }

      // Create container
      const container = await this.docker.createContainer({
        Image: resource.dockerImageUrl || 'node:18',
        name: `squadron-${resource.id}`,
        ExposedPorts: {
          [`${resource.serviceType === 'nodejs' ? '3000' : '80'}/tcp`]: {}
        },
        HostConfig: {
          PortBindings: {
            [`${resource.serviceType === 'nodejs' ? '3000' : '80'}/tcp`]: [{ HostPort: '3000' }]
          }
        },
        Env: resource.environmentVariables?.map(({ key, value }) => `${key}=${value}`) || []
      });

      // Start container
      await container.start();

      return container.id;
    } catch (error) {
      this.logger.error(`Failed to deploy resource ${resource.id}:`, error);
      throw error;
    }
  }

  async stopContainer(containerId: string): Promise<void> {
    this.logger.log(`Stopping container ${containerId}`);

    try {
      const container = this.docker.getContainer(containerId);
      await container.stop();
      await container.remove();
    } catch (error) {
      this.logger.error(`Failed to stop container ${containerId}:`, error);
      throw error;
    }
  }

  async getContainerLogs(containerId: string): Promise<string> {
    this.logger.log(`Getting logs for container ${containerId}`);

    try {
      const container = this.docker.getContainer(containerId);
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: 100,
        timestamps: true
      });

      return logs.toString();
    } catch (error) {
      this.logger.error(`Failed to get logs for container ${containerId}:`, error);
      throw error;
    }
  }

  private async cloneRepository(resource: Resource): Promise<void> {
    if (!resource.repositoryUrl) {
      throw new Error('Repository URL is required');
    }

    const repoPath = path.join(this.workspaceDir, resource.id);
    if (fs.existsSync(repoPath)) {
      fs.rmSync(repoPath, { recursive: true });
    }

    // TODO: Implement Git clone functionality
    // For now, just create a dummy directory
    fs.mkdirSync(repoPath);
  }
} 