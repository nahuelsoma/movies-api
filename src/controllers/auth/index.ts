import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginSchema, SignUpSchema } from 'src/schemas/auth';
import { AuthService } from 'src/services/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() LoginSchema: LoginSchema) {
    const { email, password } = LoginSchema;

    return await this.authService.login({ email, password });
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  async signUp(@Body() signUpSchema: SignUpSchema) {
    const { name, email, password, role } = signUpSchema;

    return await this.authService.signUp({ name, email, password, role });
  }
}
