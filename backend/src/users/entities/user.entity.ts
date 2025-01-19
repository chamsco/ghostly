import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Device } from '../../auth/entities/device.entity';

export enum AuthMethod {
  PASSWORD = 'password',
  TWO_FACTOR = 'two_factor',
  BIOMETRICS = 'biometrics'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ nullable: true })
  @Exclude()
  twoFactorSecret: string | null;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ default: false })
  isBiometricsEnabled: boolean;

  @Column({ nullable: true })
  @Exclude()
  biometricCredentialId: string | null;

  @Column({ nullable: true })
  @Exclude()
  biometricChallenge: string | null;

  @Column({
    type: 'enum',
    enum: AuthMethod,
    array: true,
    default: [AuthMethod.PASSWORD]
  })
  enabledAuthMethods: AuthMethod[];

  @Column({ default: false })
  requiresAdditionalAuth: boolean;

  @OneToMany(() => Device, device => device.user)
  devices: Device[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 