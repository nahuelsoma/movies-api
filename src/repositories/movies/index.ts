import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Database } from '../../infrastructure/database';
import { CreateMovie, EditMovie, FindAll, Movie } from './types';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

@Injectable()
export class MoviesRepository {
  constructor(
    private readonly database: Database,
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
    try {
      return await this.database.movie.create({
        data: {
          title,
          opening_crawl: openingCrawl,
          release_date: releaseDate,
          directors: {
            connectOrCreate: directorsNames.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
          producers: {
            connectOrCreate: producersNames.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
          franchise: {
            connectOrCreate: {
              where: { name: franchiseName },
              create: { name: franchiseName },
            },
          },
        },
        select: {
          id: true,
          title: true,
          opening_crawl: true,
          release_date: true,
          directors: {
            select: {
              name: true,
              id: true,
            },
          },
          producers: {
            select: {
              name: true,
              id: true,
            },
          },
          franchise: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError
      ) {
        throw error;
      }

      const message = 'Error creating movie';

      this.logger.error(message, error.stack, 'InternalServerErrorException');

      throw new InternalServerErrorException(message, error.message);
    }
  }

  async delete(id: number): Promise<Movie | null> {
    try {
      return await this.database.movie.delete({
        where: { id },
        select: {
          id: true,
          title: true,
          opening_crawl: true,
          release_date: true,
          directors: {
            select: {
              name: true,
              id: true,
            },
          },
          producers: {
            select: {
              name: true,
              id: true,
            },
          },
          franchise: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError
      ) {
        throw error;
      }

      const message = `Error deleting movie with id ${id}`;

      this.logger.error(message, error.stack, 'InternalServerErrorException');

      throw new InternalServerErrorException(message, error.message);
    }
  }

  async findAll({ skip, take }: FindAll): Promise<Movie[]> {
    try {
      return await this.database.movie.findMany({
        skip,
        take,
        select: {
          id: true,
          title: true,
          opening_crawl: true,
          release_date: true,
          directors: {
            select: {
              name: true,
              id: true,
            },
          },
          producers: {
            select: {
              name: true,
              id: true,
            },
          },
          franchise: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError
      ) {
        throw error;
      }

      const message = 'Error finding movies';

      this.logger.error(message, error.stack, 'InternalServerErrorException');

      throw new InternalServerErrorException(message, error.message);
    }
  }

  async findOne(id: number): Promise<Movie | null> {
    try {
      return await this.database.movie.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          opening_crawl: true,
          release_date: true,
          directors: {
            select: {
              name: true,
              id: true,
            },
          },
          producers: {
            select: {
              name: true,
              id: true,
            },
          },
          franchise: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError
      ) {
        throw error;
      }

      const message = `Error finding movie with id ${id}`;

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
    try {
      return await this.database.movie.update({
        where: { id },
        data: {
          title,
          opening_crawl: openingCrawl,
          release_date: releaseDate,
          directors: directorsNames
            ? {
                connectOrCreate: directorsNames.map((name) => ({
                  where: { name },
                  create: { name },
                })),
                set: directorsNames.map((name) => ({
                  name,
                })),
              }
            : undefined,
          producers: producersNames
            ? {
                connectOrCreate: producersNames.map((name) => ({
                  where: { name },
                  create: { name },
                })),
                set: producersNames.map((name) => ({
                  name,
                })),
              }
            : undefined,
          franchise: franchiseName && {
            connectOrCreate: {
              where: { name: franchiseName },
              create: { name: franchiseName },
            },
          },
        },
        select: {
          id: true,
          title: true,
          opening_crawl: true,
          release_date: true,
          directors: {
            select: {
              name: true,
              id: true,
            },
          },
          producers: {
            select: {
              name: true,
              id: true,
            },
          },
          franchise: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2016') {
          const message = `Movie with id ${id} not found`;

          throw new NotFoundException(message, {
            cause: error,
            description: 'Not found',
          });
        }

        throw error;
      }

      if (error instanceof PrismaClientValidationError) {
        throw error;
      }

      const message = `Error updating movie with id ${id}`;

      this.logger.error(message, error.stack, 'InternalServerErrorException');

      throw new InternalServerErrorException(message, error.message);
    }
  }
}
