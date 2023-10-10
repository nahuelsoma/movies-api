import { AxiosError } from 'axios';
import { HttpModule } from '@nestjs/axios';
import { InternalServerErrorException } from '@nestjs/common';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { StarwarsRepository } from '.';
import { Test } from '@nestjs/testing';
import * as nock from 'nock';
import { StarwarsMovie, StarwarsMovies } from './types';

const moduleMocker = new ModuleMocker(global);

describe('StarwarsRepository', () => {
  const mockDependencies = async ({ mockStarwarsRepository }) => {
    const moduleRef = await Test.createTestingModule({
      providers: [StarwarsRepository],
      imports: [HttpModule],
    })
      .useMocker((token) => {
        if (token === StarwarsRepository) {
          return mockStarwarsRepository;
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    return moduleRef.get(StarwarsRepository);
  };

  const mockStarwarsMovie: StarwarsMovie = {
    title: 'A New Hope',
    opening_crawl: 'It is a period of civil war.',
    director: 'George Lucas',
    producer: 'Gary Kurtz, Rick McCallum',
    release_date: '1977-05-25',
  };

  const mockStarwarsMovies: StarwarsMovies = {
    count: 1,
    results: [mockStarwarsMovie],
  };

  describe('getSeedData method', () => {
    describe('When the request succeeds', () => {
      it('Should return an array of cats', async () => {
        const mockStarwarsRepository = {
          getSeedData: jest.fn().mockResolvedValue(mockStarwarsMovies),
        };
        const scope = nock('https://swapi.dev')
          .get('/api/films')
          .reply(200, mockStarwarsMovies);

        const provider = await mockDependencies({ mockStarwarsRepository });

        const seedData = await provider.getSeedData();

        expect(scope.isDone()).toBeTruthy();
        expect(scope.pendingMocks()).toEqual([]);
        expect(seedData).toEqual(mockStarwarsMovies);
      });
    });

    describe('When the request fails', () => {
      describe('And the error is an AxiosError', () => {
        it('Should throw an AxiosError', async () => {
          const mockStarwarsRepository = {
            getSeedData: jest.fn().mockResolvedValue(mockStarwarsMovies),
          };
          const scope = nock('https://swapi.dev')
            .get('/api/films')
            .reply(500, new Error('Test Error'));

          try {
            const provider = await mockDependencies({ mockStarwarsRepository });
            await provider.getSeedData();
          } catch (error) {
            expect(error).toBeInstanceOf(AxiosError);
            expect(error.message).toBe('Request failed with status code 500');
            expect(error.response.status).toBe(500);
            expect(scope.isDone()).toBeTruthy();
            expect(scope.pendingMocks()).toEqual([]);
          }
        });
      });
    });

    describe('And the error is not an AxiosError', () => {
      it('Should throw an InternalServerErrorException', async () => {
        const mockStarwarsRepository = {
          getSeedData: jest.fn().mockRejectedValue(new Error('Test Error')),
        };
        const scope = nock('https://swapi.dev')
          .get('/api/films')
          .reply(200, mockStarwarsMovies);

        const provider = await mockDependencies({ mockStarwarsRepository });

        try {
          await provider.getSeedData();
        } catch (error) {
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Error getting movies from Starwars API');
          expect(scope.isDone()).toBeTruthy();
          expect(scope.pendingMocks()).toEqual([]);
        }
      });
    });
  });
});
