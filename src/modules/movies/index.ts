import { Module } from '@nestjs/common';
import { MoviesController } from 'src/controllers/movies';
import { MoviesService } from 'src/services/movies';
import { StarwarsRepository } from 'src/repositories/starwars';
import { MoviesRepository } from 'src/repositories/movies';
import { DatabaseRepository } from 'src/repositories/database';

@Module({
  imports: [],
  controllers: [MoviesController],
  providers: [
    DatabaseRepository,
    MoviesRepository,
    MoviesService,
    StarwarsRepository,
  ],
})
export class MoviesModule {}
