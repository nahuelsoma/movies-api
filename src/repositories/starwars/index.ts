import { InternalServerErrorException, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

export class StarwarsRepository {
  constructor(private readonly logger: Logger) {}

  async getSeedData(): Promise<StarwarsMovies> {
    try {
      const { data } = await axios<StarwarsMovies>({
        method: 'get',
        url: 'https://swapi.dev/api/filmsa',
      });

      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }

      const message = 'Error getting movies from starwars api';

      this.logger.error(message, error.stack, 'InternalServerErrorException');

      throw new InternalServerErrorException(message, error.message);
    }
  }
}
