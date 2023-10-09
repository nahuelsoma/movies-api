import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Put,
  Param,
  Delete,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { AxiosError } from 'axios';
import { Public, Roles } from 'src/decorators';
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
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<Movie[]> {
    return await this.moviesService.getAll({
      limit: limit && parseInt(limit),
      offset: offset && parseInt(offset),
    });
  }

  @Roles(RoleEnum.ADMIN)
  @Post()
  async create(
    @Body('title') title?: string,
    @Body('opening_crawl') openingCrawl?: string,
    @Body('release_date') releaseDate?: string,
    @Body('directors_names') directorsNames?: string[],
    @Body('producers_names') producersNames?: string[],
    @Body('franchise_name') franchiseName?: string,
  ): Promise<Movie> {
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
  async getOne(@Param('id') id: string): Promise<Movie> {
    return await this.moviesService.getOne(parseInt(id));
  }

  @Roles(RoleEnum.ADMIN)
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
    return await this.moviesService.update({
      id: parseInt(id),
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
  async delete(@Param('id') id: string): Promise<DeleteResponse> {
    return await this.moviesService.delete(parseInt(id));
  }

  @Roles(RoleEnum.ADMIN)
  @Post('/seed')
  async seedData(): Promise<Movie[]> {
    return await this.moviesService.seedData();
  }
}
