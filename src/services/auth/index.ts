import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { UsersService } from '../users';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload, SignIn, SignInResponse } from './types';
import { CreateUser, User } from 'src/repositories/users/types';
import * as bcrypt from 'bcrypt';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login({ email, password }: SignIn): Promise<SignInResponse> {
    try {
      const user = await this.usersService.getOne({ email, isLogin: true });

      const isPasswordValid = await bcrypt.compare(
        password,
        user?.password || '',
      );

      if (!user || !isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const payload: JWTPayload = {
        id: user.id,
        email: user.email,
        role: user.role.name,
      };

      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      // enhance error logging
      console.log('error in AuthService.login: ', error.message);

      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError ||
        error instanceof HttpException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error logging in. Please try again later.',
        error.message,
      );
    }
  }

  async signUp({ name, email, password, role }: CreateUser): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      return await this.usersService.create({
        name,
        email,
        password: hashedPassword,
        role,
      });
    } catch (error) {
      // enhance error logging
      console.log('error in AuthService.signUp: ', error.message);

      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError ||
        error instanceof HttpException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error signing up. Please try again later.',
        error.message,
      );
    }
  }
}
