import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
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
    private readonly logger: Logger,
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
    const deletedMovie = await this.moviesRepository.delete(id);

    return {
      message: `Movie with id ${deletedMovie.id} was deleted successfully`,
      status: 'success',
    };
  }

  async getAll({ limit, offset }: GetAll): Promise<Movie[]> {
    return await this.moviesRepository.findAll({
      skip: offset,
      take: limit,
    });
  }

  async getOne(id: number): Promise<Movie> {
    const movie = await this.moviesRepository.findOne(id);

    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    return movie;
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

      const newMovies = newMoviesResults.map((newMovie) => {
        if (newMovie.status === 'fulfilled') {
          return newMovie.value;
        }
      });

      return newMovies;
    } catch (error) {
      if (
        error instanceof AxiosError ||
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError ||
        error instanceof HttpException
      ) {
        throw error;
      }

      const message = 'Error seeding movies';

      this.logger.error(message, error.stack, 'InternalServerErrorException');

      throw new InternalServerErrorException(message, error.message);
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
