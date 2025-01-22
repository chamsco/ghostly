import { User, UserRole } from './user';

export interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
  message: string;
  requiresTwoFactor?: boolean;
}

export interface TwoFactorResponse {
  qrCode: string;
  secret: string;
}

export interface BiometricRegistrationOptions {
  challenge: string;
  rpId: string;
  userId: string;
  userName: string;
}

export interface BiometricAuthenticationOptions {
  challenge: string;
  rpId: string;
  allowCredentials: Array<{
    id: string;
    type: 'public-key';
  }>;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
} 