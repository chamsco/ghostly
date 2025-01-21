/**
 * User Types
 * 
 * Defines types and interfaces for user data:
 * - User: Main user interface with all properties
 * - UserRole: Enum of possible user roles
 * - UserStatus: Enum of possible user statuses
 * - CreateUserDto: Data required to create a new user
 */

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  isAdmin: boolean;
  twoFactorEnabled: boolean;
  isBiometricsEnabled: boolean;
  requiresAdditionalAuth: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
} 