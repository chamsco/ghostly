import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastActive: Date;

  @ManyToOne(() => User, user => user.devices, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;
} 