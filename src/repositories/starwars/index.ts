import axios from 'axios';

export class StarwarsRepository {
  async seedData(): Promise<StarwarsMovies> {
    try {
      const { data } = await axios<StarwarsMovies>({
        method: 'get',
        url: 'https://swapi.dev/api/films',
      });

      return data;
    } catch (error) {
      // enhace this error handling
      console.log('error in StarwarsRepository.seedData: ', error.message);

      return { count: 0, results: [] };
    }
  }
}
