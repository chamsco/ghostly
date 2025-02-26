import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UnauthorizedException, ConflictException, InternalServerErrorException, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UserResponseDto } from './dto/user-response.dto';

interface RequestWithUser extends Request {
  user: {
    id: string;
    isAdmin: boolean;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard)  // All routes require authentication
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AdminGuard)  // Only admins can get all users
  async getAllUsers(): Promise<UserResponseDto[]> {
    try {
      const users = await this.usersService.findAll();
      return users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
        status: user.isVerified ? 'active' : 'inactive',
        lastActive: user.updated_at,
        created_at: user.created_at
      }));
    } catch (error) {
      if (error.code === '42P01') {
        throw new InternalServerErrorException('Database setup incomplete');
      }
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  @Post()
  @UseGuards(AdminGuard)  // Only admins can create users
  async createUser(@Body() userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    isAdmin?: boolean;
  }): Promise<UserResponseDto> {
    try {
      const user = await this.usersService.create(userData);
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
        status: user.isVerified ? 'active' : 'inactive',
        created_at: user.created_at
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() userData: Partial<User>,
    @Req() req: RequestWithUser
  ): Promise<UserResponseDto> {
    try {
      // Check if user is updating their own profile or is an admin
      if (id !== req.user.id && !req.user.isAdmin) {
        throw new UnauthorizedException('You can only update your own profile');
      }

      // Only admins can update admin status
      if (userData.isAdmin !== undefined && !req.user.isAdmin) {
        delete userData.isAdmin;
      }

      const user = await this.usersService.update(id, userData);
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
        status: user.isVerified ? 'active' : 'inactive',
        lastActive: user.updated_at
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  @Delete(':id')
  @UseGuards(AdminGuard)  // Only admins can delete users
  async deleteUser(@Param('id') id: string): Promise<void> {
    try {
      await this.usersService.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
} 