import { Entity, Column, PrimaryGeneratedColumn, created_ateColumn, updated_ateColumn } from 'typeorm';
import { ProjectType } from '../types/project.types';

@Entity('env_templates')
export class EnvTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: ProjectType
  })
  projectType: ProjectType;

  @Column('simple-array', { nullable: true })
  variables: string[];

  @created_ateColumn()
  created_at: Date;

  @updated_ateColumn()
  updated_at: Date;
} 