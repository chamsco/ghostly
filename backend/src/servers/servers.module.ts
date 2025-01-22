/**
 * Server Module
 * 
 * Configures and exports server-related functionality:
 * - Server entity registration
 * - Server controller
 * - Server service
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServersController } from './servers.controller';
import { ServersService } from './servers.service';
import { Server } from './entities/server.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Server])],
  controllers: [ServersController],
  providers: [ServersService],
  exports: [ServersService]
})
export class ServersModule {} 