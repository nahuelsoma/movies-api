import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users';
import { AuthService } from 'src/services/auth';
import { AuthController } from 'src/controllers/auth';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.AUTH_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, Logger],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
