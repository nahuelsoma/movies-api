import { Injectable } from '@nestjs/common';
import { Database } from '../../infrastructure/database';
import { CreateMovie, EditMovie, FindAll, Movie } from './types';

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
      return this.database.movie.create({
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
      // enhace this error handling
      console.log('error in MoviesRepository.create: ', error.message);

      return null;
    }
  }

  async findAll({ skip = 0, take = 10 }: FindAll): Promise<Movie[]> {
    try {
      return this.database.movie.findMany({
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
      // enhace this error handling
      console.log('error in MoviesRepository.findAll: ', error.message);

      return [];
    }
  }

  async findOne(id: number): Promise<Movie> {
    try {
      return this.database.movie.findUnique({
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
      // enhace this error handling
      console.log('error in MoviesRepository.findUnique: ', error.message);

      return null;
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
      return this.database.movie.update({
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
      // enhace this error handling
      console.log('error in MoviesRepository.update: ', error.message);

      return null;
    }
  }
}
