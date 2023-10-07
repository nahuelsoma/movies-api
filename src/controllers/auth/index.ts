import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { Public, Roles } from 'src/decorators';
import { RoleEnum } from 'src/repositories/users/types';
import { AuthService } from 'src/services/auth';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body('email') email: string, @Body('password') password: string) {
    try {
      return this.authService.login({ email, password });
    } catch (error) {
      console.log('error in AuthController.signIn: ', error.message);

      return null;
    }
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  signUp(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('role') role?: string,
  ) {
    try {
      return this.authService.signUp({ name, email, password, role });
    } catch (error) {
      console.log('error in AuthController.signUp: ', error.message);

      return null;
    }
  }
}
