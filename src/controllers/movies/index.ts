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
import { Public, Roles } from 'src/decorators';
import {
  GetAllMoviesSchema,
  CreateMovieSchema,
  DeleteMovieSchema,
  GetMovieSchema,
  UpdateMovieSchema,
} from 'src/schemas/movies';
import { Movie } from 'src/repositories/movies/types';
import { RoleEnum } from 'src/repositories/users/types';
import { MoviesService } from 'src/services/movies';
import { DeleteResponse } from 'src/services/movies/types';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Public()
  @Get()
  async getAll(
    @Query() getAllMoviesSchema: GetAllMoviesSchema,
  ): Promise<Movie[]> {
    const { limit, offset } = getAllMoviesSchema;

    return await this.moviesService.getAll({
      limit,
      offset,
    });
  }

  @Roles(RoleEnum.ADMIN)
  @Post()
  async create(@Body() createMovieSchema: CreateMovieSchema): Promise<Movie> {
    const {
      title,
      opening_crawl: openingCrawl,
      release_date: releaseDate,
      directors_names: directorsNames,
      producers_names: producersNames,
      franchise_name: franchiseName,
    } = createMovieSchema;

    return await this.moviesService.create({
      title,
      openingCrawl,
      releaseDate: new Date(releaseDate),
      directorsNames,
      producersNames,
      franchiseName,
    });
  }

  @Roles(...[RoleEnum.ADMIN, RoleEnum.REGULAR])
  @Get(':id')
  async getOne(@Param() { id }: GetMovieSchema): Promise<Movie> {
    return await this.moviesService.getOne(id);
  }

  @Roles(RoleEnum.ADMIN)
  @Put(':id')
  async update(
    @Param() { id }: GetMovieSchema,
    @Body() updateMovieSchema: UpdateMovieSchema,
  ): Promise<Movie> {
    const {
      title,
      opening_crawl: openingCrawl,
      release_date: releaseDate,
      directors_names: directorsNames,
      producers_names: producersNames,
      franchise_name: franchiseName,
    } = updateMovieSchema;

    return await this.moviesService.update({
      id,
      title,
      openingCrawl,
      releaseDate: releaseDate && new Date(releaseDate),
      directorsNames,
      producersNames,
      franchiseName,
    });
  }

  @Roles(RoleEnum.ADMIN)
  @Delete(':id')
  async delete(@Param() { id }: DeleteMovieSchema): Promise<DeleteResponse> {
    return await this.moviesService.delete(id);
  }

  @Roles(RoleEnum.ADMIN)
  @Post('/seed')
  async seedData(): Promise<Movie[]> {
    return await this.moviesService.seedData();
  }
}
