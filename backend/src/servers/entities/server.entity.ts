/**
 * Server Entity
 * 
 * Represents a server in the system that can host projects
 * Supports both local and remote servers with SSH configuration
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ProjectType } from '../../projects/types/project.types';

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

  @Column({ default: 22 })
  port: number;

  @Column()
  username: string;

  @Column()
  @Exclude()
  privateKey: string;

  @Column({ default: false })
  isBuildServer: boolean;

  @Column({ default: false })
  isSwarmManager: boolean;

  @Column({ default: false })
  isSwarmWorker: boolean;

  @Column('simple-array', { default: [] })
  supportedTypes: ProjectType[];

  @Column({ default: 'offline' })
  status: 'online' | 'offline';

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
} 