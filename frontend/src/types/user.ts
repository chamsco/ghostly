/**
 * User Types
 * 
 * Defines types and interfaces for user data:
 * - User: Main user interface with all properties
 * - UserRole: Enum of possible user roles
 * - UserStatus: Enum of possible user statuses
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
  firstName: string;
  lastName: string;
  fullName?: string;
  isAdmin: boolean;
  status: UserStatus;
  requiresAdditionalAuth: boolean;
  twoFactorEnabled: boolean;
  lastActive?: string;
  isBiometricsEnabled: boolean;
  created_at: string;
  updated_at: string;
} 