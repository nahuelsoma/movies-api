import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MoviesService } from 'src/services/movies';
import { MoviesModule } from 'src/modules/movies';
import { Movie } from 'src/repositories/movies/types';

describe('Movies', () => {
  let app: INestApplication;

  const mockApp = async (moviesService: any): Promise<INestApplication> => {
    const moduleRef = await Test.createTestingModule({
      imports: [MoviesModule],
    })
      .overrideProvider(MoviesService)
      .useValue(moviesService)
      .compile();

    app = moduleRef.createNestApplication();
    return app;
  };

  afterEach(async () => {
    await app.close();
  });

  const mockMovie: Movie = {
    id: 1,
    title: 'test movie',
    opening_crawl: 'test opening crawl',
    release_date: new Date('2021-01-01').toISOString(),
    directors: [
      {
        name: 'test director',
        id: 1,
      },
    ],
    producers: [
      {
        name: 'test producer',
        id: 1,
      },
    ],
    franchise: {
      name: 'test franchise name',
      id: 1,
    },
  };

  describe('When user sends a GET request to /movies', () => {
    describe('And the user is authenticated', () => {
      it('Should respond with the movies', async () => {
        const moviesService = {
          getAll: () => {
            return [mockMovie];
          },
        };
        const app = await mockApp(moviesService);

        await app.init();

        return request(app.getHttpServer())
          .get('/movies')
          .expect(200)
          .expect(moviesService.getAll());
      });
    });
  });

  describe('When user sends a POST request to /movies', () => {
    describe('And the user is authenticated', () => {
      it('Should respond with the created movie', async () => {
        const moviesService = {
          create: () => {
            return mockMovie;
          },
        };
        const app = await mockApp(moviesService);

        await app.init();

        return request(app.getHttpServer())
          .post('/movies')
          .expect(201)
          .expect(moviesService.create());
      });
    });
  });

  describe('When user sends a GET request to /movies/:id', () => {
    describe('And the user is authenticated', () => {
      it('Should respond with the movie', async () => {
        const moviesService = {
          getOne: () => {
            return mockMovie;
          },
        };
        const app = await mockApp(moviesService);

        await app.init();

        return request(app.getHttpServer())
          .get('/movies/1')
          .expect(200)
          .expect(moviesService.getOne());
      });
    });
  });

  describe('When user sends a PUT request to /movies/:id', () => {
    describe('And the user is authenticated', () => {
      it('Should respond with the updated movie', async () => {
        const moviesService = {
          update: () => {
            return mockMovie;
          },
        };
        const app = await mockApp(moviesService);

        await app.init();

        return request(app.getHttpServer())
          .put('/movies/1')
          .expect(200)
          .expect(moviesService.update());
      });
    });
  });

  describe('When user sends a DELETE request to /movies/:id', () => {
    describe('And the user is authenticated', () => {
      it('Should respond with the deleted movie', async () => {
        const mockResponse = {
          message: `Movie with id 1 was deleted successfully`,
          status: 'success',
        };

        const moviesService = {
          delete: () => {
            return mockResponse;
          },
        };
        const app = await mockApp(moviesService);

        await app.init();

        return request(app.getHttpServer())
          .delete('/movies/1')
          .expect(200)
          .expect(moviesService.delete());
      });
    });
  });

  describe('When user sends a POST request to /movies/seed', () => {
    describe('And the user is authenticated', () => {
      it('Should respond with the seeded movies', async () => {
        const moviesService = {
          seedData: () => {
            return [mockMovie];
          },
        };
        const app = await mockApp(moviesService);

        await app.init();

        return request(app.getHttpServer())
          .post('/movies/seed')
          .expect(201)
          .expect(moviesService.seedData());
      });
    });
  });
});
