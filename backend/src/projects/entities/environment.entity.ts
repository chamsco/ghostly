import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { Resource } from '../../resources/entities/resource.entity';
import { EnvironmentVariable } from './environment-variable.entity';
import { EnvironmentType } from '../types/project.types';

@Entity()
export class Environment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: EnvironmentType,
    default: EnvironmentType.DEV
  })
  type: EnvironmentType;

  @ManyToOne(() => Project, project => project.environments, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @OneToMany(() => Resource, resource => resource.environment)
  resources: Resource[];

  @OneToMany(() => EnvironmentVariable, variable => variable.environment)
  variables: EnvironmentVariable[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 