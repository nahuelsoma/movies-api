import { Injectable } from '@nestjs/common';
import { DatabaseRepository } from '../database';
import { CreateMovie, Movie } from './types';

@Injectable()
export class MoviesRepository {
  constructor(private database: DatabaseRepository) {}

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
}
