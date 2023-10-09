import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
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
    return await this.authService.login({ email, password });
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
    return await this.authService.signUp({ name, email, password, role });
  }
}
