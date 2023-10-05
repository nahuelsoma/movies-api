import { Controller, Get } from '@nestjs/common';
import { MoviesService } from 'src/services/movies';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  async getMovies(): Promise<Movie[]> {
    try {
      return await this.moviesService.getMovies();
    } catch (error) {
      console.log('error in MoviesController.getMovies: ', error.message);

      return [];
    }
  }
}
