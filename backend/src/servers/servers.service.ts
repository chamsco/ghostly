/**
 * Server Service
 * 
 * Handles business logic for server management:
 * - CRUD operations for servers
 * - Server status checks
 * - SSH configuration management
 */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from './entities/server.entity';
import { CreateServerDto } from './dto/create-server.dto';
import { NodeSSH } from 'node-ssh';

@Injectable()
export class ServersService {
  constructor(
    @InjectRepository(Server)
    private readonly serverRepository: Repository<Server>,
  ) {}

  /**
   * Find all servers
   */
  async findAll(): Promise<Server[]> {
    return this.serverRepository.find();
  }

  /**
   * Find a server by ID
   */
  async findOne(id: string): Promise<Server> {
    const server = await this.serverRepository.findOne({ where: { id } });
    if (!server) {
      throw new NotFoundException(`Server with ID ${id} not found`);
    }
    return server;
  }

  /**
   * Create a new server
   */
  async create(createServerDto: CreateServerDto): Promise<Server> {
    const server = this.serverRepository.create(createServerDto);
    await this.testConnection(server);
    return this.serverRepository.save(server);
  }

  /**
   * Update a server
   */
  async update(id: string, serverData: Partial<Server>): Promise<Server> {
    const server = await this.findOne(id);
    
    // Check name uniqueness if name is being updated
    if (serverData.name && serverData.name !== server.name) {
      const existingServer = await this.serverRepository.findOne({
        where: { name: serverData.name }
      });

      if (existingServer) {
        throw new ConflictException(`Server with name ${serverData.name} already exists`);
      }
    }

    // Check host uniqueness if host is being updated
    if (serverData.host && serverData.host !== server.host) {
      const existingHost = await this.serverRepository.findOne({
        where: { host: serverData.host }
      });

      if (existingHost) {
        throw new ConflictException(`Server with host ${serverData.host} already exists`);
      }
    }

    Object.assign(server, serverData);
    return this.serverRepository.save(server);
  }

  /**
   * Delete a server
   */
  async remove(id: string): Promise<void> {
    const result = await this.serverRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Server with ID ${id} not found`);
    }
  }

  async testConnection(server: Server): Promise<boolean> {
    const ssh = new NodeSSH();
    try {
      await ssh.connect({
        host: server.host,
        port: server.port,
        username: server.username,
        privateKey: server.privateKey,
      });
      server.status = 'online';
      return true;
    } catch (error) {
      server.status = 'offline';
      return false;
    } finally {
      ssh.dispose();
    }
  }

  async checkConnection(id: string): Promise<boolean> {
    const server = await this.findOne(id);
    return this.testConnection(server);
  }
} 