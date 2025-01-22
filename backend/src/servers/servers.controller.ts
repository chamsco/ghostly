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
    return this.serversService.create(createServerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all servers' })
  @ApiResponse({ status: 200, description: 'Return all servers.' })
  async findAll(): Promise<Server[]> {
    return this.serversService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a server by id' })
  @ApiResponse({ status: 200, description: 'Return the server.' })
  @ApiResponse({ status: 404, description: 'Server not found.' })
  async findOne(@Param('id') id: string): Promise<Server> {
    return this.serversService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a server' })
  @ApiResponse({ status: 200, description: 'Server deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Server not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.serversService.remove(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a server' })
  @ApiResponse({ status: 200, description: 'Server updated successfully.' })
  @ApiResponse({ status: 404, description: 'Server not found.' })
  async update(
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

  @Get(':id/check-connection')
  @ApiOperation({ summary: 'Check server connection' })
  @ApiResponse({ status: 200, description: 'Connection status.' })
  @ApiResponse({ status: 404, description: 'Server not found.' })
  async checkConnection(@Param('id') id: string): Promise<{ status: boolean }> {
    const status = await this.serversService.checkConnection(id);
    return { status };
  }
} 