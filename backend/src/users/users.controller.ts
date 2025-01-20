import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
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
        lastActive: user.updatedAt,
        createdAt: user.createdAt
      }));
    } catch (error) {
      if (error.code === '42P01') {
        throw new InternalServerErrorException('Database setup incomplete');
      }
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  @Post()
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
        createdAt: user.createdAt
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
    @Body() userData: Partial<User>
  ): Promise<UserResponseDto> {
    try {
      const user = await this.usersService.update(id, userData);
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
        status: user.isVerified ? 'active' : 'inactive',
        lastActive: user.updatedAt
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    try {
      await this.usersService.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
} 