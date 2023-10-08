import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { Public } from 'src/decorators';
import { AuthService } from 'src/services/auth';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    try {
      return await this.authService.login({ email, password });
    } catch (error) {
      console.log('error in AuthController.login: ', error.message);

      throw new InternalServerErrorException('Error logging in');
    }
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  async signUp(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('role') role?: string,
  ) {
    try {
      return await this.authService.signUp({ name, email, password, role });
    } catch (error) {
      console.log('error in AuthController.signUp: ', error.message);

      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException('Error signing up');
    }
  }
}
