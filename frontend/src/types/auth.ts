export interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  requiresTwoFactor?: boolean;
}

export interface TwoFactorResponse {
  secret: string;
  qrCode: string;
} 