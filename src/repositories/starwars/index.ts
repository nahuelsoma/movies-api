import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import { StarwarsMovies } from './types';

@Injectable()
export class StarwarsRepository {
  constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService,
  ) {}

  async getSeedData(): Promise<StarwarsMovies> {
    try {
      const url = 'https://swapi.dev/api/films';

      const response: AxiosResponse<StarwarsMovies> =
        await this.httpService.axiosRef.get(url);

      const { data: starwarsMovies } = response;

      return starwarsMovies;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }

      const message = 'Error getting movies from Starwars API';

      this.logger.error(message, error.stack, 'InternalServerErrorException');

      throw new InternalServerErrorException(message, error.message);
    }
  }
}
