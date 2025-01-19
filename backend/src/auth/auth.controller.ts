import { 
  Controller, 
  Post, 
  Body, 
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
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

    return this.authService.login(
      user,
      loginDto.deviceName,
      req.headers['user-agent'] || 'unknown',
      req.ip,
      loginDto.rememberMe
    );
  }

  @Post('refresh')
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Body('deviceId') deviceId: string
  ) {
    return this.authService.refreshToken(refreshToken, deviceId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Body('refreshToken') refreshToken: string,
    @Body('deviceId') deviceId: string
  ) {
    await this.authService.logout(refreshToken, deviceId);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout/all')
  async logoutAll(@Req() req: RequestWithUser) {
    await this.authService.logoutAllDevices(req.user.id);
    return { message: 'Logged out from all devices' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('devices')
  async getDevices(@Req() req: RequestWithUser) {
    const devices = await this.authService.getDevices(req.user.id);
    return devices.map(device => ({
      ...device,
      current: device.id === req.user.deviceId
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Post('biometrics/register')
  async registerBiometrics(@Req() req: RequestWithUser) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.id }
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.authService.generateBiometricRegistrationOptions(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('biometrics/register/complete')
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

  @UseGuards(JwtAuthGuard)
  @Post('biometrics/disable')
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
      select: ['id', 'username', 'email', 'fullName', 'isAdmin']
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
} 