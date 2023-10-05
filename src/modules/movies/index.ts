import { Module } from '@nestjs/common';
import { MoviesController } from 'src/controllers/movies';
import { MoviesService } from 'src/services/movies';
import { StarwarsRepository } from 'src/repositories/starwars';

@Module({
  imports: [],
  controllers: [MoviesController],
  providers: [StarwarsRepository, MoviesService],
})
export class MoviesModule {}
