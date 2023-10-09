import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
  Logger,
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
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
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
      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError ||
        error instanceof HttpException
      ) {
        throw error;
      }

      const message = 'Error logging in. Please try again later.';

      this.logger.error(message, error.stack, 'InternalServerErrorException');

      throw new InternalServerErrorException(message, error.message);
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
      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError ||
        error instanceof HttpException
      ) {
        throw error;
      }

      const message = 'Error signing up. Please try again later.';

      this.logger.error(message, error.stack, 'InternalServerErrorException');

      throw new InternalServerErrorException(message, error.message);
    }
  }
}
