import { Module } from '@nestjs/common';
import { AuthModule } from '../auth';
import { MoviesModule } from '../movies';

@Module({
  imports: [MoviesModule, AuthModule],
})
export class CoreModule {}
