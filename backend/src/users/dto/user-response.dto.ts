export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
  status: 'active' | 'inactive';
  lastActive?: Date;
  createdAt?: Date;
} 