import { Injectable, UnauthorizedException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User, AuthMethod } from '../users/entities/user.entity';
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

    try {
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
        enabledAuthMethods: [AuthMethod.PASSWORD],
        // First user becomes admin
        isAdmin: (await this.usersRepository.count()) === 0,
        requiresAdditionalAuth: false
      });

      return this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === '42P01') { // relation does not exist
        throw new InternalServerErrorException('Database setup incomplete. Please contact support.');
      }
      throw new InternalServerErrorException('Failed to create user account');
    }
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersRepository.findOne({ where: { username } });
      if (!user) {
        throw new UnauthorizedException('Invalid username or password');
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid username or password');
      }
      
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error.code === '42P01') { // relation does not exist
        throw new InternalServerErrorException('Database setup incomplete. Please contact support.');
      }
      throw new InternalServerErrorException('Authentication service unavailable');
    }
  }

  async login(user: User, deviceName: string, userAgent: string, ip: string, rememberMe = false) {
    // Check if additional authentication is required
    if (user.requiresAdditionalAuth && 
        (user.enabledAuthMethods.includes(AuthMethod.TWO_FACTOR) || 
         user.enabledAuthMethods.includes(AuthMethod.BIOMETRICS))) {
      throw new UnauthorizedException('Additional authentication required');
    }

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
    const payload = { 
      sub: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: rememberMe ? '7d' : '1d'
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
        requiresAdditionalAuth: user.requiresAdditionalAuth,
        enabledAuthMethods: user.enabledAuthMethods
      },
      refreshToken: device.refreshToken,
      deviceId: device.id,
      requiresAdditionalAuth: user.requiresAdditionalAuth,
      availableAuthMethods: user.enabledAuthMethods.filter(method => method !== AuthMethod.PASSWORD)
    };
  }

  // 2FA Methods
  async generate2FASecret(userId: string) {
    const user = await this.usersRepository.findOne({ 
      where: { id: userId } 
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: 'Squadron'
    });

    user.twoFactorSecret = secret.base32;
    await this.usersRepository.save(user);

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    
    return {
      secret: secret.base32,
      qrCode
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
    user.enabledAuthMethods = [...user.enabledAuthMethods, AuthMethod.TWO_FACTOR];
    await this.usersRepository.save(user);
  }

  async disable2FA(userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ 
      where: { id: userId } 
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.enabledAuthMethods = user.enabledAuthMethods.filter(
      method => method !== AuthMethod.TWO_FACTOR
    );
    await this.usersRepository.save(user);
  }

  // Biometric Methods
  async generateBiometricRegistrationOptions(user: User) {
    const challenge = crypto.randomBytes(32);
    const registrationOptions = {
      challenge: challenge.toString('base64'),
      rp: {
        name: 'Squadron',
        id: process.env.DOMAIN || 'localhost'
      },
      user: {
        id: user.id,
        name: user.username,
        displayName: user.fullName
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' } // RS256
      ],
      timeout: 60000,
      attestation: 'direct',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        requireResidentKey: false
      }
    };

    user.biometricChallenge = challenge.toString('base64');
    await this.usersRepository.save(user);

    return registrationOptions;
  }

  async verifyBiometricRegistration(
    user: User,
    credentialId: string,
    attestationObject: string,
    clientDataJSON: string
  ) {
    // In a production environment, you would verify the attestation here
    // For this demo, we'll just store the credential ID
    user.biometricCredentialId = credentialId;
    user.isBiometricsEnabled = true;
    if (!user.enabledAuthMethods.includes(AuthMethod.BIOMETRICS)) {
      user.enabledAuthMethods = [
        ...user.enabledAuthMethods,
        AuthMethod.BIOMETRICS
      ];
    }
    await this.usersRepository.save(user);
  }

  async generateBiometricAuthenticationOptions(user: User) {
    const challenge = crypto.randomBytes(32);
    const authOptions = {
      challenge: challenge.toString('base64'),
      allowCredentials: [{
        type: 'public-key',
        id: user.biometricCredentialId
      }],
      timeout: 60000,
      userVerification: 'preferred',
      rpId: process.env.DOMAIN || 'localhost'
    };

    user.biometricChallenge = challenge.toString('base64');
    await this.usersRepository.save(user);

    return authOptions;
  }

  async verifyBiometricAssertion(
    user: User,
    credentialId: string,
    authenticatorData: string,
    clientDataJSON: string,
    signature: string
  ): Promise<boolean> {
    // In a production environment, you would verify the assertion here
    // For this demo, we'll just check if the credential ID matches
    return user.biometricCredentialId === credentialId;
  }

  async disableBiometrics(user: User) {
    user.isBiometricsEnabled = false;
    user.biometricCredentialId = null;
    user.enabledAuthMethods = user.enabledAuthMethods.filter(
      method => method !== AuthMethod.BIOMETRICS
    );
    await this.usersRepository.save(user);
  }

  // Common Methods
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
      current: false
    }));
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByCredentialId(credentialId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { biometricCredentialId: credentialId }
    });
  }

  async updateAuthenticationSettings(
    userId: string,
    requiresAdditionalAuth: boolean
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ 
      where: { id: userId } 
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.requiresAdditionalAuth = requiresAdditionalAuth;
    await this.usersRepository.save(user);
  }
} 