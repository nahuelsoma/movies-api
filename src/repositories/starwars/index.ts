import axios from 'axios';

export class StarwarsRepository {
  async getMovies(): Promise<Movies> {
    try {
      const { data } = await axios<Movies>({
        method: 'get',
        url: 'https://swapi.dev/api/films',
      });

      return data;
    } catch (error) {
      console.log('error in StarwarsRepository.getMovies: ', error.message);

      return { count: 0, results: [] };
    }
  }
}
