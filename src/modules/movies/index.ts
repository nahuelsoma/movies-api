import { Logger, Module } from '@nestjs/common';
import { MoviesController } from 'src/controllers/movies';
import { MoviesService } from 'src/services/movies';
import { StarwarsRepository } from 'src/repositories/starwars';
import { MoviesRepository } from 'src/repositories/movies';
import { Database } from 'src/infrastructure/database';

@Module({
  imports: [],
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
