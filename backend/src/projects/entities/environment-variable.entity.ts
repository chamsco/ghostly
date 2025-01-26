import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Environment } from './environment.entity';

@Entity()
export class EnvironmentVariable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string;

  @Column()
  value: string;

  @Column()
  isSecret: boolean;

  @ManyToOne(() => Environment, environment => environment.variables, {
    onDelete: 'CASCADE'
  })
  environment: Environment;
} 