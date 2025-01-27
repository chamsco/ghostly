import { Entity, PrimaryGeneratedColumn, Column, created_ateColumn, updated_ateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { Resource } from '../../resources/entities/resource.entity';
import { EnvironmentVariable } from './environment-variable.entity';
import { EnvironmentType } from '../types/project.types';

@Entity('environments')
export class Environment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: EnvironmentType
  })
  type: EnvironmentType;

  @ManyToOne(() => Project, project => project.environments)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => Resource, resource => resource.environment)
  resources: Resource[];

  @OneToMany(() => EnvironmentVariable, variable => variable.environment, {
    cascade: true
  })
  variables: EnvironmentVariable[];

  @created_ateColumn({ name: 'created_at' })
  created_at: Date;

  @updated_ateColumn({ name: 'updated_at' })
  updated_at: Date;
} 