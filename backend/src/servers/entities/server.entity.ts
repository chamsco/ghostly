/**
 * Server Entity
 * 
 * Represents a server in the system that can host projects
 * Supports both local and remote servers with SSH configuration
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ProjectType } from '../../projects/types/project.types';
import { ServerType } from '../types/server.types';

@Entity('servers')
export class Server {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  host: string;

  @Column()
  port: number;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  privateKey: string;

  @Column({ type: 'enum', enum: ServerType, default: ServerType.REMOTE })
  type: ServerType;

  @Column({ default: false })
  isSwarmManager: boolean;

  @Column({ default: false })
  isSwarmWorker: boolean;

  @Column({ default: false })
  isBuildServer: boolean;

  @Column({ nullable: true })
  domainName: string;

  @Column('jsonb', { nullable: true })
  portMappings: {
    containerPort: number;
    hostPort: number;
    protocol: 'tcp' | 'udp';
  }[];

  @Column('jsonb', { nullable: true })
  labels: Record<string, string>;

  @Column('simple-array', { default: [] })
  supportedTypes: ProjectType[];

  @Column({ default: 'offline' })
  status: 'online' | 'offline';

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
} 