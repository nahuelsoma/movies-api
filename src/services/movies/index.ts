import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MoviesRepository } from 'src/repositories/movies';
import { CreateMovie, EditMovie, Movie } from 'src/repositories/movies/types';
import { StarwarsRepository } from 'src/repositories/starwars';
import { DeleteResponse, GetAll } from './types';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { AxiosError } from 'axios';

@Injectable()
export class MoviesService {
  constructor(
    private readonly starwarsRepository: StarwarsRepository,
    private readonly moviesRepository: MoviesRepository,
  ) {}

  async create({
    title,
    openingCrawl,
    releaseDate,
    directorsNames,
    producersNames,
    franchiseName,
  }: CreateMovie): Promise<Movie> {
    return await this.moviesRepository.create({
      title,
      openingCrawl,
      releaseDate,
      directorsNames,
      producersNames,
      franchiseName,
    });
  }

  async delete(id: number): Promise<DeleteResponse> {
    try {
      const deletedMovie = await this.moviesRepository.delete(id);

      if (id === deletedMovie.id) {
        return {
          message: `Movie with id ${id} was deleted successfully`,
          status: 'success',
        };
      }

      throw new ConflictException(`Movie with id ${id} was not deleted`);
    } catch (error) {
      // enhance error logging
      console.log('error in MoviesService.delete: ', error.message);

      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error deleting movie with id ${id}`,
        error.message,
      );
    }
  }

  async getAll({ limit, offset }: GetAll): Promise<Movie[]> {
    return await this.moviesRepository.findAll({
      skip: offset,
      take: limit,
    });
  }

  async getOne(id: number): Promise<Movie> {
    return await this.moviesRepository.findOne(id);
  }

  async seedData(): Promise<Movie[]> {
    try {
      const starwarsMovies = await this.starwarsRepository.getSeedData();

      const newMoviesPromises = starwarsMovies.results.map((movie) => {
        const { title, opening_crawl, release_date, director, producer } =
          movie;

        return this.moviesRepository.create({
          title: title,
          openingCrawl: opening_crawl,
          directorsNames: director.split(', '),
          producersNames: producer.split(', '),
          franchiseName: 'Star Wars',
          releaseDate: new Date(release_date),
        });
      });

      const newMoviesResults = await Promise.allSettled(newMoviesPromises);

      if (newMoviesResults.some((newMovie) => newMovie.status === 'rejected')) {
        const rejected = newMoviesResults.map((newMovie) => {
          if (newMovie.status === 'rejected') {
            return newMovie.reason;
          }
        });

        throw new InternalServerErrorException(
          'Error seeding movies',
          rejected.join(', '),
        );
      }

      const newMovies = newMoviesResults.map((newMovie) => {
        if (newMovie.status === 'fulfilled') {
          return newMovie.value;
        }
      });

      return newMovies;
    } catch (error) {
      // enhance error logging
      console.log('error in MoviesService.seedData: ', error.message);

      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError ||
        error instanceof AxiosError ||
        error instanceof HttpException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error seeding movies',
        error.message,
      );
    }
  }

  async update({
    id,
    title,
    openingCrawl,
    releaseDate,
    directorsNames,
    producersNames,
    franchiseName,
  }: EditMovie): Promise<Movie> {
    return await this.moviesRepository.update({
      id,
      title,
      openingCrawl,
      releaseDate,
      directorsNames,
      producersNames,
      franchiseName,
    });
  }
}
