/**
 * Server Service
 * 
 * Handles business logic for server management:
 * - CRUD operations for servers
 * - Server status checks
 * - SSH configuration management
 */
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from './entities/server.entity';
import { CreateServerDto } from './dto/create-server.dto';
import { NodeSSH } from 'node-ssh';
import { ServerType } from './types/server.types';

@Injectable()
export class ServersService {
  private readonly defaultLocalServer: Partial<Server> = {
    name: 'localhost',
    host: '127.0.0.1',
    port: 8080,
    type: ServerType.LOCAL,
    isSwarmManager: true,
    isBuildServer: true,
    status: 'online' as const,
    username: 'local',
    description: 'Local development server'
  };

  constructor(
    @InjectRepository(Server)
    private readonly serverRepository: Repository<Server>
  ) {
    this.initializeLocalServer();
  }

  /**
   * Initialize the default local server if it doesn't exist
   */
  private async initializeLocalServer() {
    try {
      const existingLocalServer = await this.serverRepository.findOne({
        where: { type: ServerType.LOCAL }
      });

      if (!existingLocalServer) {
        const localServer = this.serverRepository.create(this.defaultLocalServer);
        await this.serverRepository.save(localServer);
      }
    } catch (error) {
      console.error('Failed to initialize local server:', error);
    }
  }

  /**
   * Create a new server
   */
  async create(createServerDto: CreateServerDto): Promise<Server> {
    // Check if server with same name or host already exists
    const existingServer = await this.serverRepository.findOne({
      where: [
        { name: createServerDto.name },
        { host: createServerDto.host }
      ]
    });

    if (existingServer) {
      throw new ConflictException('Server with this name or host already exists');
    }

    // For remote servers, test connection before creating
    if (createServerDto.type === ServerType.REMOTE) {
      const isConnected = await this.testConnection(createServerDto);
      if (!isConnected) {
        throw new Error('Failed to connect to server');
      }
    }

    const server = this.serverRepository.create(createServerDto);
    return this.serverRepository.save(server);
  }

  /**
   * Get all servers
   */
  async findAll(): Promise<Server[]> {
    return this.serverRepository.find();
  }

  /**
   * Get server by ID
   */
  async findOne(id: string): Promise<Server> {
    const server = await this.serverRepository.findOne({ where: { id } });
    if (!server) {
      throw new NotFoundException(`Server with ID ${id} not found`);
    }
    return server;
  }

  /**
   * Delete server by ID
   */
  async remove(id: string): Promise<void> {
    const server = await this.findOne(id);
    
    // Prevent deletion of localhost server
    if (server.type === ServerType.LOCAL) {
      throw new ConflictException('Cannot delete localhost server');
    }

    await this.serverRepository.remove(server);
  }

  /**
   * Test connection to server
   */
  async testConnection(server: CreateServerDto | Server): Promise<boolean> {
    // Skip connection test for local server
    if (server.type === ServerType.LOCAL) {
      return true;
    }

    try {
      const ssh = new NodeSSH();
      await ssh.connect({
        host: server.host,
        port: server.port,
        username: server.username,
        privateKey: server.privateKey,
      });
      
      await ssh.dispose();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get server URL based on configuration
   */
  getServerUrl(server: Server): string {
    return server.type === ServerType.LOCAL
      ? `http://127.0.0.1:8080`
      : `http://${server.host}:${server.port}`;
  }

  /**
   * Get container port mapping
   */
  getContainerPort(server: Server, containerPort: number): number {
    if (server.type === ServerType.LOCAL) {
      return 8080; // Default port for localhost
    }
    
    // For remote servers, use the container port mapping if available
    const portMapping = server.portMappings?.find(
      mapping => mapping.containerPort === containerPort
    );
    
    return portMapping?.hostPort || containerPort;
  }

  /**
   * Update server by ID
   */
  async update(id: string, serverData: Partial<Server>): Promise<Server> {
    const server = await this.findOne(id);
    
    // Prevent changing type of localhost server
    if (server.type === ServerType.LOCAL && serverData.type && serverData.type !== ServerType.LOCAL) {
      throw new ConflictException('Cannot change type of localhost server');
    }

    // For remote servers, test connection if connection details are being updated
    if (
      server.type === ServerType.REMOTE && 
      (serverData.host || serverData.port || serverData.username || serverData.privateKey)
    ) {
      const testServer = { ...server, ...serverData };
      const isConnected = await this.testConnection(testServer);
      if (!isConnected) {
        throw new Error('Failed to connect to server with new configuration');
      }
    }

    Object.assign(server, serverData);
    return this.serverRepository.save(server);
  }

  /**
   * Check connection to server by ID
   */
  async checkConnection(id: string): Promise<boolean> {
    const server = await this.findOne(id);
    return this.testConnection(server);
  }
} 