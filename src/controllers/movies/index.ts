import { Controller, Get, Post, Query } from '@nestjs/common';
import { Movie } from 'src/repositories/movies/types';
import { MoviesService } from 'src/services/movies';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  async getAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<Movie[]> {
    try {
      return await this.moviesService.getAll({
        limit: limit && parseInt(limit),
        offset: offset && parseInt(offset),
      });
    } catch (error) {
      // enhace this error handling
      console.log('error in MoviesController.getAll: ', error.message);

      return [];
    }
  }

  @Post('/seed')
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
