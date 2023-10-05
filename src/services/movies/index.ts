import { Injectable } from '@nestjs/common';
import { StarwarsRepository } from 'src/repositories/starwars';

@Injectable()
export class MoviesService {
  constructor(private readonly starwarsRepository: StarwarsRepository) {}

  async getMovies(): Promise<Movie[]> {
    try {
      const starwarsMovies = await this.starwarsRepository.getMovies();

      const movies = starwarsMovies.results.map((movie) => {
        return {
          title: movie.title,
          opening_crawl: movie.opening_crawl,
          director: movie.director,
          producer: movie.producer,
          release_date: movie.release_date,
        };
      });

      return movies;
    } catch (error) {
      console.log('error in MoviesService.getMovies: ', error.message);

      return [];
    }
  }
}
