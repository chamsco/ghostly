import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Server } from '../../servers/entities/server.entity';
import { ResourceType, DatabaseType, ServiceType } from '../types/project.types';

export enum ProjectStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  STOPPED = 'stopped'
}

@Entity('environment_variables')
export class EnvironmentVariable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string;

  @Column()
  value: string;

  @Column({ default: false })
  isSecret: boolean;
}

@Entity('environments')
export class Environment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column(() => EnvironmentVariable)
  variables: EnvironmentVariable[];

  @ManyToOne(() => Project, project => project.environments, { onDelete: 'CASCADE' })
  project: Project;
}

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
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE
  })
  status: ProjectStatus;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column(() => EnvironmentVariable)
  environmentVariables: EnvironmentVariable[];

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Server)
  server: Server;

  @Column()
  serverId: string;

  @OneToMany(() => Environment, environment => environment.project, { cascade: true })
  environments: Environment[];

  @OneToMany(() => Resource, resource => resource.project, { cascade: true })
  resources: Resource[];

  @Column(() => EnvironmentVariable)
  environmentVariables: EnvironmentVariable[];

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE
  })
  status: ProjectStatus;

  @Column({ type: 'jsonb', default: {} })
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner: User;

  @Column()
  ownerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 