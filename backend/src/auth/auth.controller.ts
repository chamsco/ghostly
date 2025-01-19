import { 
  Controller, 
  Post, 
  Body, 
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Patch
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, AuthMethod } from '../users/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
    deviceId: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return { 
      message: 'Registration successful', 
      userId: user.id 
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request
  ) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const result = await this.authService.login(
      user,
      loginDto.deviceName,
      req.headers['user-agent'] || 'unknown',
      req.ip,
      loginDto.rememberMe
    );

    return {
      ...result,
      availableAuthMethods: user.enabledAuthMethods.filter(
        method => method !== AuthMethod.PASSWORD
      )
    };
  }

  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  async generate2FA(@Req() req: RequestWithUser) {
    return this.authService.generate2FASecret(req.user.id);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  async verify2FA(
    @Req() req: RequestWithUser,
    @Body('token') token: string
  ) {
    const isValid = await this.authService.verify2FAToken(
      req.user.id,
      token
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    return { message: '2FA verification successful' };
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  async enable2FA(
    @Req() req: RequestWithUser,
    @Body('token') token: string
  ) {
    const isValid = await this.authService.verify2FAToken(
      req.user.id,
      token
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    await this.authService.enable2FA(req.user.id);
    return { message: '2FA enabled successfully' };
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  async disable2FA(@Req() req: RequestWithUser) {
    await this.authService.disable2FA(req.user.id);
    return { message: '2FA disabled successfully' };
  }

  @Post('biometrics/register')
  @UseGuards(JwtAuthGuard)
  async registerBiometrics(@Req() req: RequestWithUser) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.id }
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.authService.generateBiometricRegistrationOptions(user);
  }

  @Post('biometrics/register/complete')
  @UseGuards(JwtAuthGuard)
  async completeBiometricRegistration(
    @Req() req: RequestWithUser,
    @Body() body: {
      id: string;
      response: {
        attestationObject: string;
        clientDataJSON: string;
      };
    }
  ) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.id }
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    await this.authService.verifyBiometricRegistration(
      user,
      body.id,
      body.response.attestationObject,
      body.response.clientDataJSON
    );
    return { message: 'Biometric registration successful' };
  }

  @Post('biometrics/challenge')
  async getBiometricChallenge(@Body('username') username: string) {
    const user = await this.authService.findByUsername(username);
    if (!user || !user.isBiometricsEnabled) {
      throw new UnauthorizedException('Biometric authentication not available');
    }
    return this.authService.generateBiometricAuthenticationOptions(user);
  }

  @Post('biometrics/login')
  async loginWithBiometrics(
    @Body() body: {
      id: string;
      response: {
        authenticatorData: string;
        clientDataJSON: string;
        signature: string;
      };
    },
    @Req() req: Request
  ) {
    const user = await this.authService.findByCredentialId(body.id);
    if (!user) {
      throw new UnauthorizedException('Invalid credential');
    }

    const isValid = await this.authService.verifyBiometricAssertion(
      user,
      body.id,
      body.response.authenticatorData,
      body.response.clientDataJSON,
      body.response.signature
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid assertion');
    }

    return this.authService.login(
      user,
      'Biometric Login',
      req.headers['user-agent'] || 'unknown',
      req.ip,
      true
    );
  }

  @Post('biometrics/disable')
  @UseGuards(JwtAuthGuard)
  async disableBiometrics(@Req() req: RequestWithUser) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.id }
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    await this.authService.disableBiometrics(user);
    return { message: 'Biometrics disabled successfully' };
  }

  @Patch('settings')
  @UseGuards(JwtAuthGuard)
  async updateAuthSettings(
    @Req() req: RequestWithUser,
    @Body('requiresAdditionalAuth') requiresAdditionalAuth: boolean
  ) {
    await this.authService.updateAuthenticationSettings(
      req.user.id,
      requiresAdditionalAuth
    );
    return { message: 'Authentication settings updated successfully' };
  }

  @Get('check-users')
  async checkUsers() {
    const count = await this.userRepository.count();
    return { hasUsers: count > 0 };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Req() req: RequestWithUser) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
      select: [
        'id', 
        'username', 
        'email', 
        'fullName', 
        'isAdmin',
        'twoFactorEnabled',
        'isBiometricsEnabled',
        'enabledAuthMethods',
        'requiresAdditionalAuth'
      ]
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
} 