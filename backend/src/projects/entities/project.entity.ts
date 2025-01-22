import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProjectStatus } from '../types/project.types';
import { Resource } from './resource.entity';
import { Environment } from './environment.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  serverId: string;

  @Column()
  ownerId: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.CREATED
  })
  status: ProjectStatus;

  @OneToMany(() => Resource, resource => resource.project, {
    cascade: true
  })
  resources: Resource[];

  @OneToMany(() => Environment, environment => environment.project, {
    cascade: true
  })
  environments: Environment[];

  @Column('jsonb', { nullable: true })
  environmentVariables?: { key: string; value: string; isSecret: boolean; }[];

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
} 