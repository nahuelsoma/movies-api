import { Injectable } from '@nestjs/common';
import { MoviesRepository } from 'src/repositories/movies';
import { CreateMovie, EditMovie, Movie } from 'src/repositories/movies/types';
import { StarwarsRepository } from 'src/repositories/starwars';
import { DeleteResponse, GetAll } from './types';

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
    try {
      return await this.moviesRepository.create({
        title,
        openingCrawl,
        releaseDate,
        directorsNames,
        producersNames,
        franchiseName,
      });
    } catch (error) {
      // enhace this error handling
      console.log('error in MoviesService.create: ', error.message);

      return null;
    }
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
    } catch (error) {
      // enhace this error handling
      console.log('error in MoviesService.delete: ', error.message);

      return null;
    }
  }

  async getAll({ limit, offset }: GetAll): Promise<Movie[]> {
    try {
      return await this.moviesRepository.findAll({
        skip: offset,
        take: limit,
      });
    } catch (error) {
      // enhace this error handling
      console.log('error in MoviesService.getAll: ', error.message);

      return [];
    }
  }

  async getOne(id: number): Promise<Movie> {
    try {
      return await this.moviesRepository.findOne(id);
    } catch (error) {
      // enhace this error handling
      console.log('error in MoviesService.getOne: ', error.message);

      return null;
    }
  }

  async seedData(): Promise<Movie[]> {
    try {
      const starwarsMovies = await this.starwarsRepository.seedData();

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

        // enhace this error handling
        throw new Error(rejected.join(', '));
      }

      const newMovies = newMoviesResults.map((newMovie) => {
        if (newMovie.status === 'fulfilled') {
          return newMovie.value;
        }
      });

      return newMovies;
    } catch (error) {
      // enhace this error handling
      console.log('error in MoviesService.seedData: ', error.message);

      return [];
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
      return await this.moviesRepository.update({
        id,
        title,
        openingCrawl,
        releaseDate,
        directorsNames,
        producersNames,
        franchiseName,
      });
    } catch (error) {
      // enhace this error handling
      console.log('error in MoviesService.update: ', error.message);

      return null;
    }
  }
}
