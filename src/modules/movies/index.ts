import { Logger, Module } from '@nestjs/common';
import { MoviesController } from 'src/controllers/movies';
import { MoviesService } from 'src/services/movies';
import { StarwarsRepository } from 'src/repositories/starwars';
import { MoviesRepository } from 'src/repositories/movies';
import { Database } from 'src/infrastructure/database';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [MoviesController],
  providers: [
    Database,
    MoviesRepository,
    MoviesService,
    StarwarsRepository,
    Logger,
  ],
})
export class MoviesModule {}
