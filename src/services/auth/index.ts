import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload, SignIn, SignInResponse } from './types';
import { CreateUser, User } from 'src/repositories/users/types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp({ name, email, password, role }: CreateUser): Promise<User> {
    const user = await this.usersService.getOne({ email });

    if (user) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.usersService.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
  }

  async login({ email, password }: SignIn): Promise<SignInResponse> {
    const user = await this.usersService.getOne({ email, isLogin: true });

    const isPasswordValid = await bcrypt.compare(password, user?.password);

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
  }
}
