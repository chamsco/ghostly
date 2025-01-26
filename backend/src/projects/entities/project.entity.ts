import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectStatus } from '../types/project.types';
import { Resource } from '../../resources/entities/resource.entity';
import { Environment } from './environment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  serverId: string;

  @Column()
  ownerId: string;

  @ManyToOne(() => User, user => user.projects)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.CREATED
  })
  status: ProjectStatus;

  @OneToMany(() => Resource, resource => resource.project, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  resources: Resource[];

  @OneToMany(() => Environment, environment => environment.project, {
    cascade: true
  })
  environments: Environment[];

  @Column('jsonb', { nullable: true })
  environmentVariables?: { key: string; value: string; isSecret: boolean; }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 