import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Project } from './project.entity';

@Entity()
export class Environment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('jsonb')
  variables: { key: string; value: string; isSecret: boolean; }[];

  @ManyToOne(() => Project, project => project.environments, {
    onDelete: 'CASCADE'
  })
  project: Project;

  @Column()
  projectId: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
} 