import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Server } from '../../servers/entities/server.entity';
import { Resource } from '../../resources/entities/resource.entity';
import { Environment } from './environment.entity';
import { ProjectStatus } from '../types/project.types';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Server, { nullable: true })
  @JoinColumn({ name: 'serverId' })
  server: Server;

  @Column({ nullable: true })
  serverId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  @Column({
    type: 'varchar',
    default: ProjectStatus.CREATED
  })
  status: string;

  @OneToMany(() => Resource, resource => resource.project)
  resources: Resource[];

  @OneToMany(() => Environment, environment => environment.project)
  environments: Environment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 