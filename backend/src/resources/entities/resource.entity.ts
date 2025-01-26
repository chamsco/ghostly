import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Environment } from '../../projects/entities/environment.entity';
import { ResourceType, DatabaseType, ServiceType, ProjectStatus } from '../../projects/types/project.types';

@Entity()
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
  project: Project;

  @Column()
  projectId: string;

  @ManyToOne(() => Environment, environment => environment.resources)
  environment: Environment;

  @Column()
  environmentId: string;

  @Column({ nullable: true })
  containerId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export interface ResourceConfig {
  repositoryUrl?: string;
  branch?: string;
  target?: string;
  port?: number;
  env?: Record<string, string>;
} 