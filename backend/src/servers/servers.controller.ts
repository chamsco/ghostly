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
import { CreateServerDto } from './dto/create-server.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('servers')
@Controller('servers')
@UseGuards(JwtAuthGuard)
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new server' })
  @ApiResponse({ status: 201, description: 'Server created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() createServerDto: CreateServerDto): Promise<Server> {
    console.log('Creating server:', createServerDto);
    try {
      const server = await this.serversService.create(createServerDto);
      console.log('Server created successfully:', server);
      return server;
    } catch (error) {
      console.error('Failed to create server:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all servers' })
  @ApiResponse({ status: 200, description: 'Return all servers.' })
  async findAll(): Promise<Server[]> {
    console.log('Fetching all servers');
    try {
      const servers = await this.serversService.findAll();
      console.log(`Found ${servers.length} servers`);
      return servers;
    } catch (error) {
      console.error('Failed to fetch servers:', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a server by id' })
  @ApiResponse({ status: 200, description: 'Return the server.' })
  @ApiResponse({ status: 404, description: 'Server not found.' })
  async findOne(@Param('id') id: string): Promise<Server> {
    console.log('Fetching server by id:', id);
    try {
      const server = await this.serversService.findOne(id);
      console.log('Server found:', server);
      return server;
    } catch (error) {
      console.error(`Failed to fetch server ${id}:`, error);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a server' })
  @ApiResponse({ status: 200, description: 'Server deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Server not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    console.log('Deleting server:', id);
    try {
      await this.serversService.remove(id);
      console.log('Server deleted successfully');
    } catch (error) {
      console.error(`Failed to delete server ${id}:`, error);
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a server' })
  @ApiResponse({ status: 200, description: 'Server updated successfully.' })
  @ApiResponse({ status: 404, description: 'Server not found.' })
  async update(
    @Param('id') id: string,
    @Body() serverData: Partial<Server>
  ): Promise<Server> {
    console.log('Updating server:', id, serverData);
    try {
      const server = await this.serversService.update(id, serverData);
      console.log('Server updated successfully:', server);
      return server;
    } catch (error) {
      console.error(`Failed to update server ${id}:`, error);
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update server');
    }
  }

  @Get(':id/check-connection')
  @ApiOperation({ summary: 'Check server connection' })
  @ApiResponse({ status: 200, description: 'Connection status.' })
  @ApiResponse({ status: 404, description: 'Server not found.' })
  async checkConnection(@Param('id') id: string): Promise<{ status: boolean }> {
    console.log('Checking connection for server:', id);
    try {
      const status = await this.serversService.checkConnection(id);
      console.log('Connection check result:', { id, status });
      return { status };
    } catch (error) {
      console.error(`Failed to check connection for server ${id}:`, error);
      throw error;
    }
  }
} 