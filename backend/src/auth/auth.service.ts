import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const { email, password, username, fullName } = registerDto;

    // Check if user exists
    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException(
        existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = this.usersRepository.create({
      email,
      username,
      password: hashedPassword,
      fullName,
      // First user becomes admin
      isAdmin: (await this.usersRepository.count()) === 0,
    });

    return this.usersRepository.save(user);
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { username } 
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async generate2FASecret(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `Hostking:${process.env.APP_NAME || 'Development'}`
    });

    const user = await this.usersRepository.findOne({ 
      where: { id: userId } 
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.twoFactorSecret = secret.base32;
    await this.usersRepository.save(user);

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    return {
      secret: secret.base32,
      qrCode: qrCodeUrl
    };
  }

  async verify2FAToken(userId: string, token: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ 
      where: { id: userId } 
    });

    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA not set up');
    }

    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });
  }

  async enable2FA(userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ 
      where: { id: userId } 
    });

    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA not set up');
    }

    user.twoFactorEnabled = true;
    await this.usersRepository.save(user);
  }
} 