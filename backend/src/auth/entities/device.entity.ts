import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, created_ateColumn, updated_ateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  refreshToken: string;

  @Column()
  lastIp: string;

  @Column()
  userAgent: string;

  @created_ateColumn()
  created_at: Date;

  @updated_ateColumn()
  lastActive: Date;

  @ManyToOne(() => User, user => user.devices, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;
} 