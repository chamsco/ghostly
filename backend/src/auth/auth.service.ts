import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { Device } from './entities/device.entity';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
    private jwtService: JwtService,
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

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async generate2FASecret(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `Ghostly:${process.env.APP_NAME || 'Development'}`
    });

    const user = await this.usersRepository.findOne({ 
      where: { id: userId } 
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.twoFactorSecret = secret.base32;
    await this.usersRepository.save(user);

    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: user.email,
      issuer: `Ghostly:${process.env.APP_NAME || 'Development'}`,
      encoding: 'base32'
    });

    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);
    
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

  async login(user: User, deviceName: string, userAgent: string, ip: string, rememberMe = false) {
    // Create device record
    const device = this.devicesRepository.create({
      name: deviceName,
      userAgent,
      lastIp: ip,
      user,
      refreshToken: crypto.randomBytes(40).toString('hex')
    });
    await this.devicesRepository.save(device);

    // Generate tokens
    const payload = { sub: user.id, deviceId: device.id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: rememberMe ? '30d' : '1d'
    });

    return {
      user,
      token: accessToken,
      refreshToken: device.refreshToken,
      deviceId: device.id
    };
  }

  async refreshToken(refreshToken: string, deviceId: string) {
    const device = await this.devicesRepository.findOne({
      where: { id: deviceId, refreshToken },
      relations: ['user']
    });

    if (!device) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Update device activity
    device.lastActive = new Date();
    await this.devicesRepository.save(device);

    // Generate new tokens
    const payload = { sub: device.user.id, deviceId: device.id };
    const accessToken = this.jwtService.sign(payload);
    const newRefreshToken = crypto.randomBytes(40).toString('hex');

    // Update refresh token
    device.refreshToken = newRefreshToken;
    await this.devicesRepository.save(device);

    return {
      token: accessToken,
      refreshToken: newRefreshToken
    };
  }

  async logout(refreshToken: string, deviceId: string) {
    const device = await this.devicesRepository.findOne({
      where: { id: deviceId, refreshToken }
    });

    if (device) {
      await this.devicesRepository.remove(device);
    }
  }

  async logoutAllDevices(userId: string) {
    await this.devicesRepository.delete({ userId });
  }

  async getDevices(userId: string) {
    const devices = await this.devicesRepository.find({
      where: { userId },
      order: { lastActive: 'DESC' }
    });

    return devices.map(device => ({
      id: device.id,
      name: device.name,
      lastActive: device.lastActive,
      current: false // This will be set to true on the frontend for the current device
    }));
  }

  // Biometric authentication methods
  async generateBiometricRegistrationOptions(user: User) {
    const challenge = crypto.randomBytes(32);
    
    return {
      challenge: challenge.toString('base64'),
      rpId: process.env.WEBAUTHN_RP_ID || 'localhost',
      user: {
        id: user.id,
        name: user.username,
        displayName: user.fullName
      }
    };
  }

  async verifyBiometricRegistration(
    user: User,
    credentialId: string,
    publicKey: string,
    challenge: string
  ) {
    // In a real implementation, you would verify the attestation
    // using @simplewebauthn/server package
    
    const credential = {
      credentialId,
      publicKey,
      counter: 0
    };

    user.biometricCredentials = user.biometricCredentials || [];
    user.biometricCredentials.push(credential);
    user.isBiometricsEnabled = true;

    await this.usersRepository.save(user);
  }

  async generateBiometricAuthenticationOptions(user: User) {
    if (!user.isBiometricsEnabled) {
      throw new BadRequestException('Biometrics not enabled for this user');
    }

    const challenge = crypto.randomBytes(32);
    
    return {
      challenge: challenge.toString('base64'),
      rpId: process.env.WEBAUTHN_RP_ID || 'localhost',
      allowCredentials: user.biometricCredentials.map(cred => ({
        id: cred.credentialId,
        type: 'public-key'
      }))
    };
  }

  async verifyBiometricAssertion(
    user: User,
    credentialId: string,
    authenticatorData: string,
    clientDataJSON: string,
    signature: string
  ) {
    // In a real implementation, you would verify the assertion
    // using @simplewebauthn/server package
    
    const credential = user.biometricCredentials.find(
      cred => cred.credentialId === credentialId
    );

    if (!credential) {
      throw new UnauthorizedException('Invalid credential');
    }

    // Update the credential counter
    credential.counter += 1;
    await this.usersRepository.save(user);

    return true;
  }

  async disableBiometrics(user: User) {
    user.isBiometricsEnabled = false;
    user.biometricCredentials = [];
    await this.usersRepository.save(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByCredentialId(credentialId: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where(`user.biometricCredentials @> '[{"credentialId": :credentialId}]'`, { credentialId })
      .getOne();
  }
} 