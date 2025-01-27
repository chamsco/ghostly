import { Entity, PrimaryGeneratedColumn, Column, created_ateColumn, updated_ateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Environment } from '../../projects/entities/environment.entity';
import { ResourceType, DatabaseType, ServiceType, ProjectStatus } from '../../projects/types/project.types';

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

  @Column()
  serverId: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.CREATED
  })
  status: ProjectStatus;

  @Column({ nullable: true })
  error?: string;

  @Column('jsonb', { nullable: true })
  environmentVariables?: { key: string; value: string; isSecret: boolean; }[];

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

  @ManyToOne(() => Project, project => project.resources, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @ManyToOne(() => Environment, environment => environment.resources, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'environmentId' })
  environment: Environment;
  
  @Column()
  environmentId: string;

  @Column({ nullable: true })
  containerId: string | null;

  @created_ateColumn({ name: 'created_at' })
  created_at: Date;

  @updated_ateColumn({ name: 'updated_at' })
  updated_at: Date;
}

export interface ResourceConfig {
  repositoryUrl?: string;
  branch?: string;
  target?: string;
  port?: number;
  env?: Record<string, string>;
} 