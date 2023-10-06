import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { Movie } from 'src/repositories/movies/types';
import { MoviesService } from 'src/services/movies';
import { DeleteResponse } from 'src/services/movies/types';

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

  @Post()
  async create(
    @Body('title') title?: string,
    @Body('opening_crawl') openingCrawl?: string,
    @Body('release_date') releaseDate?: string,
    @Body('directors_names') directorsNames?: string[],
    @Body('producers_names') producersNames?: string[],
    @Body('franchise_name') franchiseName?: string,
  ): Promise<Movie> {
    try {
      return await this.moviesService.create({
        title,
        openingCrawl,
        releaseDate: new Date(releaseDate),
        directorsNames,
        producersNames,
        franchiseName,
      });
    } catch (error) {
      // enhace this error handling
      console.log('error in MoviesController.create: ', error.message);

      return null;
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Movie> {
    try {
      return await this.moviesService.getOne(parseInt(id));
    } catch (error) {
      // enhace this error handling
      console.log('error in MoviesController.getOne: ', error.message);

      return null;
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body('title') title?: string,
    @Body('opening_crawl') openingCrawl?: string,
    @Body('release_date') releaseDate?: string,
    @Body('directors_names') directorsNames?: string[],
    @Body('producers_names') producersNames?: string[],
    @Body('franchise_name') franchiseName?: string,
  ): Promise<Movie> {
    try {
      return await this.moviesService.update({
        id: parseInt(id),
        title,
        openingCrawl,
        releaseDate: releaseDate && new Date(releaseDate),
        directorsNames,
        producersNames,
        franchiseName,
      });
    } catch (error) {
      // enhace this error handling
      console.log('error in MoviesController.update: ', error.message);

      return null;
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<DeleteResponse> {
    try {
      return await this.moviesService.delete(parseInt(id));
    } catch (error) {
      // enhace this error handling
      console.log('error in MoviesController.delete: ', error.message);

      return null;
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
