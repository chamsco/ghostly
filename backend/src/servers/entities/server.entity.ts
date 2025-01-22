/**
 * Server Entity
 * 
 * Represents a server in the system that can host projects
 * Supports both local and remote servers with SSH configuration
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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

  @Column({ default: 'root' })
  username: string;

  @Column()
  privateKey: string;

  @Column({ default: false })
  isBuildServer: boolean;

  @Column({ default: false })
  isSwarmManager: boolean;

  @Column({ default: false })
  isSwarmWorker: boolean;

  @Column('simple-array', { default: [] })
  supportedTypes: ProjectType[];

  @Column({
    type: 'enum',
    enum: ['online', 'offline'],
    default: 'offline'
  })
  status: 'online' | 'offline';

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
} 