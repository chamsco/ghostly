import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from './project.entity';
import { Server } from '../../servers/entities/server.entity';
import { ResourceType, DatabaseType, ServiceType } from '../types/project.types';

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ResourceType
  })
  type: ResourceType;

  @ManyToOne(() => Server)
  server: Server;

  @Column()
  serverId: string;

  @Column({
    type: 'enum',
    enum: ['active', 'paused', 'stopped', 'failed'],
    default: 'stopped'
  })
  status: 'active' | 'paused' | 'stopped' | 'failed';

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column('jsonb', { default: [] })
  environmentVariables: Array<{
    key: string;
    value: string;
    isSecret: boolean;
  }>;

  // Database specific fields
  @Column({
    type: 'enum',
    enum: DatabaseType,
    nullable: true
  })
  databaseType?: DatabaseType;

  @Column({ nullable: true })
  databaseName?: string;

  @Column({ nullable: true })
  adminEmail?: string;

  @Column({ nullable: true })
  initialDatabase?: string;

  @Column({ nullable: true })
  dbPassword?: string;

  // Service specific fields
  @Column({
    type: 'enum',
    enum: ServiceType,
    nullable: true
  })
  serviceType?: ServiceType;

  @Column({ nullable: true })
  repositoryUrl?: string;

  @Column({ type: 'text', nullable: true })
  dockerComposeContent?: string;

  @Column({ nullable: true })
  dockerImageUrl?: string;

  // Website specific fields
  @Column({ nullable: true })
  branch?: string;

  @ManyToOne(() => Project, project => project.resources, { onDelete: 'CASCADE' })
  project: Project;

  @Column()
  projectId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 