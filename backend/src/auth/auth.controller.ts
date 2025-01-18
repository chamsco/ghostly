import { 
  Controller, 
  Post, 
  Body, 
  Session, 
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    @Session() session: Record<string, any>
  ) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password
    );

    if (user.twoFactorEnabled) {
      session.pendingSecondFactor = {
        userId: user.id,
        timestamp: Date.now()
      };
      return { 
        message: '2FA required',
        requiresTwoFactor: true 
      };
    }

    session.userId = user.id;
    session.isAdmin = user.isAdmin;

    return { 
      message: 'Login successful',
      requiresTwoFactor: false
    };
  }

  @Post('2fa/generate')
  async generate2FA(@Session() session: Record<string, any>) {
    if (!session.userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    return this.authService.generate2FASecret(session.userId);
  }

  @Post('2fa/verify')
  async verify2FA(
    @Body('token') token: string,
    @Session() session: Record<string, any>
  ) {
    const pendingAuth = session.pendingSecondFactor;
    
    if (!pendingAuth || Date.now() - pendingAuth.timestamp > 300000) { // 5 minutes
      throw new UnauthorizedException('Invalid or expired 2FA session');
    }

    const isValid = await this.authService.verify2FAToken(
      pendingAuth.userId,
      token
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    const user = await this.usersRepository.findOne({ 
      where: { id: pendingAuth.userId } 
    });

    session.userId = user.id;
    session.isAdmin = user.isAdmin;
    delete session.pendingSecondFactor;

    return { message: '2FA verification successful' };
  }

  @Post('2fa/enable')
  async enable2FA(
    @Body('token') token: string,
    @Session() session: Record<string, any>
  ) {
    if (!session.userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    const isValid = await this.authService.verify2FAToken(
      session.userId,
      token
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    await this.authService.enable2FA(session.userId);
    return { message: '2FA enabled successfully' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Session() session: Record<string, any>) {
    session.destroy();
    return { message: 'Logged out successfully' };
  }
} 