import { Logger, Module } from '@nestjs/common';
import { Database } from 'src/infrastructure/database';
import { UsersRepository } from 'src/repositories/users';
import { UsersService } from 'src/services/users';

@Module({
  providers: [UsersService, UsersRepository, Database, Logger],
  exports: [UsersService],
})
export class UsersModule {}
