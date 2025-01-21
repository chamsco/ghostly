import { UserRole } from './user';

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
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: UserRole;
    twoFactorEnabled: boolean;
    isBiometricsEnabled: boolean;
    requiresAdditionalAuth: boolean;
  };
  message: string;
  requiresTwoFactor?: boolean;
}

export interface TwoFactorResponse {
  secret: string;
  qrCode: string;
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