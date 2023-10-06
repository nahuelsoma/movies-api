import { Injectable } from '@nestjs/common';
import { MoviesRepository } from 'src/repositories/movies';
import { Movie } from 'src/repositories/movies/types';
import { StarwarsRepository } from 'src/repositories/starwars';

@Injectable()
export class MoviesService {
  constructor(
    private readonly starwarsRepository: StarwarsRepository,
    private readonly moviesRepository: MoviesRepository,
  ) {}

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
}
