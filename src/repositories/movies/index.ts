import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Database } from '../../infrastructure/database';
import { CreateMovie, EditMovie, FindAll, Movie } from './types';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

@Injectable()
export class MoviesRepository {
  constructor(private database: Database) {}

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
      // enhance error logging
      console.log('error in MoviesRepository.create: ', error);

      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error creating movie. Please try again later.',
        error.message,
      );
    }
  }

  async delete(id: number): Promise<Movie> {
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
      // enhace error logging
      console.log('error in MoviesRepository.delete: ', error.message);

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

  async findAll({ skip = 0, take = 10 }: FindAll): Promise<Movie[]> {
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
      // enhace error logging
      console.log('error in MoviesRepository.findAll: ', error.message);

      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error getting all movies',
        error.message,
      );
    }
  }

  async findOne(id: number): Promise<Movie> {
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
      // enhace error logging
      console.log('error in MoviesRepository.findUnique: ', error.message);

      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error getting movie with id ${id}`,
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
      // enhace error logging
      console.log('error in MoviesRepository.update: ', error.message);

      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error updating movie with id ${id}`,
        error.message,
      );
    }
  }
}
