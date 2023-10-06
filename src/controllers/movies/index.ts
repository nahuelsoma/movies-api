import { Controller, Get } from '@nestjs/common';
import { Movie } from 'src/repositories/movies/types';
import { MoviesService } from 'src/services/movies';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('/seed')
  async seedData(): Promise<Movie[]> {
    try {
      return await this.moviesService.seedData();
    } catch (error) {
      // enhace this error handling
      console.log('error in MoviesController.seedData: ', error.message);

      return [];
    }
  }
}
