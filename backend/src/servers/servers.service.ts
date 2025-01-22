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
  async create(serverData: CreateServerDto): Promise<Server> {
    // Check if server with same name exists
    const existingServer = await this.serverRepository.findOne({
      where: { name: serverData.name }
    });

    if (existingServer) {
      throw new ConflictException(`Server with name ${serverData.name} already exists`);
    }

    // Check if server with same host exists
    const existingHost = await this.serverRepository.findOne({
      where: { host: serverData.host }
    });

    if (existingHost) {
      throw new ConflictException(`Server with host ${serverData.host} already exists`);
    }

    const server = this.serverRepository.create({
      ...serverData,
      status: 'offline'
    });

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
  async delete(id: string): Promise<void> {
    const server = await this.findOne(id);
    await this.serverRepository.remove(server);
  }

  async checkConnection(id: string): Promise<boolean> {
    const server = await this.findOne(id);
    // TODO: Implement SSH connection check
    return true;
  }
} 