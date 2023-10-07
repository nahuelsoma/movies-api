import { Module } from '@nestjs/common';
import { Database } from 'src/infrastructure/database';
import { UsersRepository } from 'src/repositories/users';
import { UsersService } from 'src/services/users';

@Module({
  providers: [UsersService, UsersRepository, Database],
  exports: [UsersService],
})
export class UsersModule {}
