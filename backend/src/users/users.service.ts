import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        'id',
        'username',
        'email',
        'fullName',
        'isAdmin',
        'isVerified',
        'created_at',
        'updated_at'
      ]
    });
  }

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'email',
        'fullName',
        'isAdmin',
        'isVerified',
        'created_at',
        'updated_at'
      ]
    });
  }

  async create(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    isAdmin?: boolean;
  }): Promise<User> {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: [
          { username: userData.username },
          { email: userData.email }
        ]
      });

      if (existingUser) {
        throw new ConflictException(
          existingUser.email === userData.email
            ? 'Email already registered'
            : 'Username already taken'
        );
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = this.usersRepository.create({
        ...userData,
        password: hashedPassword,
        isVerified: true
      });

      return this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }

      const updatedUser = await this.usersRepository.save({
        ...user,
        ...userData,
        id
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.usersRepository.delete(id);
      if (result.affected === 0) {
        throw new UnauthorizedException('User not found');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
} 