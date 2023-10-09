import { InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

export class StarwarsRepository {
  async getSeedData(): Promise<StarwarsMovies> {
    try {
      const { data } = await axios<StarwarsMovies>({
        method: 'get',
        url: 'https://swapi.dev/api/films',
      });

      return data;
    } catch (error) {
      // enhance error logging
      console.log('error in StarwarsRepository.seedData: ', error.message);

      if (error instanceof AxiosError) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error getting movies from starwars api',
        error.message,
      );
    }
  }
}
