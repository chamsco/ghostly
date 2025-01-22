/**
 * Server Entity
 * 
 * Represents a server in the system that can host projects
 * Supports both local and remote servers with SSH configuration
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProjectType } from '../../projects/types/project.types';

@Entity('servers')
export class Server {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['local', 'remote'],
    default: 'local'
  })
  type: 'local' | 'remote';

  @Column('simple-array')
  supportedTypes: ProjectType[];

  @Column({ nullable: true })
  host?: string;

  @Column('json', { nullable: true })
  sshConfig?: {
    username: string;
    privateKey: string;
    port: number;
  };

  @Column({
    type: 'enum',
    enum: ['online', 'offline'],
    default: 'offline'
  })
  status: 'online' | 'offline';

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
} 