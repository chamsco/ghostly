/**
 * Server Controller
 * 
 * Handles HTTP requests for server management:
 * - List all servers
 * - Get server details
 * - Create new servers
 * - Update existing servers
 * - Delete servers
 */
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  ConflictException,
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ServersService } from './servers.service';
import { Server } from './entities/server.entity';

@Controller('servers')
@UseGuards(JwtAuthGuard)
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Get()
  async getAllServers(): Promise<Server[]> {
    try {
      return await this.serversService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch servers');
    }
  }

  @Get(':id')
  async getServer(@Param('id') id: string): Promise<Server> {
    try {
      return await this.serversService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch server');
    }
  }

  @Post()
  async createServer(@Body() serverData: Partial<Server>): Promise<Server> {
    try {
      return await this.serversService.create(serverData);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create server');
    }
  }

  @Put(':id')
  async updateServer(
    @Param('id') id: string,
    @Body() serverData: Partial<Server>
  ): Promise<Server> {
    try {
      return await this.serversService.update(id, serverData);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update server');
    }
  }

  @Delete(':id')
  async deleteServer(@Param('id') id: string): Promise<void> {
    try {
      await this.serversService.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete server');
    }
  }
} 