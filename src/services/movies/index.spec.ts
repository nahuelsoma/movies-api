import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Test } from '@nestjs/testing';
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MoviesService } from '.';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { StarwarsRepository } from 'src/repositories/starwars';
import { MoviesRepository } from 'src/repositories/movies';
import { AxiosError } from 'axios';
import { Movie } from 'src/repositories/movies/types';

const moduleMocker = new ModuleMocker(global);

describe('MoviesService', () => {
  const mockDependencies = async ({
    mockStarwarsRepository,
    mockMoviesRepository,
  }) => {
    const moduleRef = await Test.createTestingModule({
      providers: [MoviesService],
    })
      .useMocker((token) => {
        if (token === StarwarsRepository) {
          return mockStarwarsRepository;
        }
        if (token === MoviesRepository) {
          return mockMoviesRepository;
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

    return moduleRef.get(MoviesService);
  };

  const mockMovie: Movie = {
    id: 1,
    title: 'test movie',
    opening_crawl: 'test opening crawl',
    release_date: new Date('2021-01-01'),
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

  describe('create method', () => {
    it('Should return the created movie', async () => {
      const mockMoviesRepository = {
        create: jest.fn().mockResolvedValue(mockMovie),
      };
      const mockStarwarsRepository = jest.fn();
      const provider = await mockDependencies({
        mockMoviesRepository,
        mockStarwarsRepository,
      });

      const result = await provider.create({
        title: 'test movie',
        openingCrawl: 'test opening crawl',
        releaseDate: new Date('2021-01-01'),
        directorsNames: ['test director'],
        producersNames: ['test producer'],
        franchiseName: 'test franchise name',
      });

      expect(result).toEqual(mockMovie);
    });

    it("Should call the repository's create method with the correct params", async () => {
      const mockMoviesRepository = {
        create: jest.fn().mockResolvedValue(mockMovie),
      };
      const mockStarwarsRepository = jest.fn();
      const provider = await mockDependencies({
        mockMoviesRepository,
        mockStarwarsRepository,
      });

      await provider.create({
        title: 'test movie',
        openingCrawl: 'test opening crawl',
        releaseDate: new Date('2021-01-01'),
        directorsNames: ['test director'],
        producersNames: ['test producer'],
        franchiseName: 'test franchise name',
      });

      expect(mockMoviesRepository.create).toHaveBeenCalledWith({
        title: 'test movie',
        openingCrawl: 'test opening crawl',
        releaseDate: new Date('2021-01-01'),
        directorsNames: ['test director'],
        producersNames: ['test producer'],
        franchiseName: 'test franchise name',
      });
    });
  });

  describe('delete method', () => {
    it('Should return the deleted movie message and status', async () => {
      const expected = {
        message: 'Movie with id 1 was deleted successfully',
        status: 'success',
      };
      const mockMoviesRepository = {
        delete: jest.fn().mockResolvedValue(mockMovie),
      };
      const mockStarwarsRepository = jest.fn();
      const provider = await mockDependencies({
        mockMoviesRepository,
        mockStarwarsRepository,
      });

      const result = await provider.delete(1);

      expect(result).toEqual(expected);
    });

    it("Should call the repository's delete method with the correct params", async () => {
      const mockMoviesRepository = {
        delete: jest.fn().mockResolvedValue(mockMovie),
      };
      const mockStarwarsRepository = jest.fn();
      const provider = await mockDependencies({
        mockMoviesRepository,
        mockStarwarsRepository,
      });

      await provider.delete(1);

      expect(mockMoviesRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('getAll method', () => {
    it('Should return the movies', async () => {
      const mockMoviesRepository = {
        findAll: jest.fn().mockResolvedValue([mockMovie]),
      };
      const mockStarwarsRepository = jest.fn();
      const provider = await mockDependencies({
        mockMoviesRepository,
        mockStarwarsRepository,
      });

      const result = await provider.getAll({
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual([mockMovie]);
    });

    it("Should call the repository's findAll method with the correct params", async () => {
      const mockMoviesRepository = {
        findAll: jest.fn().mockResolvedValue([mockMovie]),
      };
      const mockStarwarsRepository = jest.fn();
      const provider = await mockDependencies({
        mockMoviesRepository,
        mockStarwarsRepository,
      });

      await provider.getAll({
        limit: 10,
        offset: 0,
      });

      expect(mockMoviesRepository.findAll).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });
  });

  describe('getOne method', () => {
    describe('When the movie exists', () => {
      it('Should return the movie', async () => {
        const mockMoviesRepository = {
          findOne: jest.fn().mockResolvedValue(mockMovie),
        };
        const mockStarwarsRepository = jest.fn();
        const provider = await mockDependencies({
          mockMoviesRepository,
          mockStarwarsRepository,
        });

        const result = await provider.getOne(1);

        expect(result).toEqual(mockMovie);
      });
    });

    describe("When the movie doesn't exist", () => {
      it('Should throw a NotFoundException', async () => {
        const mockMoviesRepository = {
          findOne: jest.fn().mockResolvedValue(null),
        };
        const mockStarwarsRepository = jest.fn();
        const provider = await mockDependencies({
          mockMoviesRepository,
          mockStarwarsRepository,
        });

        try {
          await provider.getOne(1);
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toBe('Movie with id 1 not found');
        }
      });
    });

    it("Should call the repository's findOne method with the correct params", async () => {
      const mockMoviesRepository = {
        findOne: jest.fn().mockResolvedValue(mockMovie),
      };
      const mockStarwarsRepository = jest.fn();
      const provider = await mockDependencies({
        mockMoviesRepository,
        mockStarwarsRepository,
      });

      await provider.getOne(1);

      expect(mockMoviesRepository.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('seedData method', () => {
    const mockedStarwarsMovies = {
      results: [
        {
          title: 'test title',
          opening_crawl: 'test opening crawl',
          release_date: '2021-01-01',
          director: 'test director',
          producer: 'test producer',
        },
      ],
    };

    it('Should return the created movies', async () => {
      const mockMoviesRepository = {
        create: jest.fn().mockResolvedValue(mockMovie),
      };
      const mockStarwarsRepository = {
        getSeedData: jest.fn().mockResolvedValue(mockedStarwarsMovies),
      };
      const provider = await mockDependencies({
        mockMoviesRepository,
        mockStarwarsRepository,
      });

      const result = await provider.seedData();

      expect(result).toEqual([mockMovie]);
    });

    it("Should call the starwars repository's getSeedData method and the movies repository's create method with the correct params", async () => {
      const mockMoviesRepository = {
        create: jest.fn().mockResolvedValue(mockMovie),
      };
      const mockStarwarsRepository = {
        getSeedData: jest.fn().mockResolvedValue(mockedStarwarsMovies),
      };
      const provider = await mockDependencies({
        mockMoviesRepository,
        mockStarwarsRepository,
      });

      await provider.seedData();

      expect(mockStarwarsRepository.getSeedData).toHaveBeenCalled();
      expect(mockMoviesRepository.create).toHaveBeenCalledWith({
        title: 'test title',
        openingCrawl: 'test opening crawl',
        releaseDate: new Date('2021-01-01'),
        directorsNames: ['test director'],
        producersNames: ['test producer'],
        franchiseName: 'Star Wars',
      });
    });

    describe('When the starwars repository throws an axios error', () => {
      it('Should throw an AxiosError', async () => {
        const mockMoviesRepository = {
          create: jest.fn().mockResolvedValue(null),
        };
        const mockStarwarsRepository = {
          getSeedData: jest
            .fn()
            .mockRejectedValue(new AxiosError('test error')),
        };
        const provider = await mockDependencies({
          mockMoviesRepository,
          mockStarwarsRepository,
        });

        try {
          await provider.seedData();
        } catch (error) {
          expect(error).toBeInstanceOf(AxiosError);
          expect(error.message).toBe('test error');
        }
      });
    });

    describe('When the movie repository throws an error', () => {
      describe('And the error is a PrismaClientKnownRequestError', () => {
        it('Should throw a PrismaClientKnownRequestError with the correct message and code', async () => {
          const mockMoviesRepository = {
            create: jest.fn().mockRejectedValue(
              new PrismaClientKnownRequestError('test error', {
                clientVersion: 'test client version',
                code: 'test code',
              }),
            ),
          };
          const mockStarwarsRepository = {
            getSeedData: jest.fn().mockResolvedValue(mockedStarwarsMovies),
          };
          const provider = await mockDependencies({
            mockMoviesRepository,
            mockStarwarsRepository,
          });

          try {
            await provider.seedData();
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
            expect(error.message).toBe('test error');
            expect(error.code).toBe('test code');
          }
        });
      });

      describe('And the error is a PrismaClientValidationError', () => {
        it('Should throw a PrismaClientValidationError with the correct message', async () => {
          const mockMoviesRepository = {
            create: jest.fn().mockRejectedValue(
              new PrismaClientValidationError('test error', {
                clientVersion: 'test client version',
              }),
            ),
          };
          const mockStarwarsRepository = {
            getSeedData: jest.fn().mockResolvedValue(mockedStarwarsMovies),
          };
          const provider = await mockDependencies({
            mockMoviesRepository,
            mockStarwarsRepository,
          });

          try {
            await provider.seedData();
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientValidationError);
            expect(error.message).toBe('test error');
          }
        });
      });

      describe('And the error is an HttpException', () => {
        it('Should throw an HttpException with the correct message and status', async () => {
          const mockMoviesRepository = {
            create: jest
              .fn()
              .mockRejectedValue(new HttpException('test error', 400)),
          };
          const mockStarwarsRepository = {
            getSeedData: jest.fn().mockResolvedValue(mockedStarwarsMovies),
          };
          const provider = await mockDependencies({
            mockMoviesRepository,
            mockStarwarsRepository,
          });

          try {
            await provider.seedData();
          } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.message).toBe('test error');
            expect(error.status).toBe(400);
          }
        });
      });
    });

    describe('When the error is an unknown error', () => {
      it('Should throw an InternalServerErrorException', async () => {
        const mockMoviesRepository = {
          create: jest.fn().mockRejectedValue(new Error('test error')),
        };
        const mockStarwarsRepository = {
          getSeedData: jest.fn().mockResolvedValue(new Error('test error')),
        };
        const provider = await mockDependencies({
          mockMoviesRepository,
          mockStarwarsRepository,
        });

        try {
          await provider.seedData();
        } catch (error) {
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Error seeding movies');
        }
      });
    });
  });

  describe('update method', () => {
    it('Should return the updated movie', async () => {
      const mockMoviesRepository = {
        update: jest.fn().mockResolvedValue(mockMovie),
      };
      const mockStarwarsRepository = jest.fn();
      const provider = await mockDependencies({
        mockMoviesRepository,
        mockStarwarsRepository,
      });

      const result = await provider.update({
        id: 1,
        title: 'test movie',
        openingCrawl: 'test opening crawl',
        releaseDate: new Date('2021-01-01'),
        directorsNames: ['test director'],
        producersNames: ['test producer'],
        franchiseName: 'test franchise name',
      });

      expect(result).toEqual(mockMovie);
    });

    it("Should call the repository's update method with the correct params", async () => {
      const mockMoviesRepository = {
        update: jest.fn().mockResolvedValue(mockMovie),
      };
      const mockStarwarsRepository = jest.fn();
      const provider = await mockDependencies({
        mockMoviesRepository,
        mockStarwarsRepository,
      });

      await provider.update({
        id: 1,
        title: 'test movie',
        openingCrawl: 'test opening crawl',
        releaseDate: new Date('2021-01-01'),
        directorsNames: ['test director'],
        producersNames: ['test producer'],
        franchiseName: 'test franchise name',
      });

      expect(mockMoviesRepository.update).toHaveBeenCalledWith({
        id: 1,
        title: 'test movie',
        openingCrawl: 'test opening crawl',
        releaseDate: new Date('2021-01-01'),
        directorsNames: ['test director'],
        producersNames: ['test producer'],
        franchiseName: 'test franchise name',
      });
    });
  });
});
