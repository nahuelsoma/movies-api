import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { MoviesController } from '.';
import { Test } from '@nestjs/testing';
import { MoviesService } from 'src/services/movies';
import { InternalServerErrorException } from '@nestjs/common';

const moduleMocker = new ModuleMocker(global);

describe('MoviesController', () => {
  const mockDependencies = async ({ mockMoviesService }) => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MoviesController],
    })
      .useMocker((token) => {
        if (token === MoviesService) {
          return mockMoviesService;
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

    return moduleRef.get(MoviesController);
  };

  const getMockMovie = (id: number) => ({
    id,
    title: `test movie ${id}`,
    opening_crawl: `test opening crawl ${id}`,
    release_date: new Date('2020-01-01'),
    directors: [
      {
        id: 1,
        name: 'test director',
      },
    ],
    producers: [
      {
        id: 1,
        name: 'test producer',
      },
    ],
    franchise: [
      {
        id: 1,
        name: 'test franchise',
      },
    ],
  });

  describe('getAll method', () => {
    it('Should return an array of movies', async () => {
      const expectedResult = [getMockMovie(1), getMockMovie(2)];
      const mockMoviesService = {
        getAll: jest.fn().mockResolvedValue(expectedResult),
      };
      const controller = await mockDependencies({ mockMoviesService });

      const result = await controller.getAll();

      expect(result).toEqual(expectedResult);
    });

    it("Should call the service's getAll method with the correct params", async () => {
      const mockMoviesService = {
        getAll: jest.fn().mockResolvedValue([]),
      };
      const controller = await mockDependencies({ mockMoviesService });

      await controller.getAll('1', '2');

      expect(mockMoviesService.getAll).toHaveBeenCalledWith({
        limit: 1,
        offset: 2,
      });
    });

    describe("When the service's getAll method fails", () => {
      it('Should throw an InternalServerErrorException', async () => {
        const mockMoviesService = {
          getAll: jest.fn().mockRejectedValue(new Error('test error')),
        };
        const controller = await mockDependencies({ mockMoviesService });

        try {
          await controller.getAll();
        } catch (error) {
          expect(error.message).toEqual('Error getting movies');
          expect(error.status).toEqual(500);
          expect(error).toBeInstanceOf(InternalServerErrorException);
        }
      });
    });
  });

  describe('create method', () => {
    it('Should return a movie', async () => {
      const expectedResult = getMockMovie(1);
      const mockMoviesService = {
        create: jest.fn().mockResolvedValue(expectedResult),
      };
      const controller = await mockDependencies({ mockMoviesService });

      const result = await controller.create(
        'test movie 1',
        'test opening crawl 1',
        '2020-01-01',
        ['test director'],
        ['test producer'],
        'test franchise',
      );

      expect(result).toEqual(expectedResult);
    });

    it("Should call the service's create method with the correct params", async () => {
      const mockMoviesService = {
        create: jest.fn().mockResolvedValue([]),
      };
      const controller = await mockDependencies({ mockMoviesService });

      await controller.create(
        'test movie 1',
        'test opening crawl 1',
        '2020-01-01',
        ['test director'],
        ['test producer'],
        'test franchise',
      );

      expect(mockMoviesService.create).toHaveBeenCalledWith({
        title: 'test movie 1',
        openingCrawl: 'test opening crawl 1',
        releaseDate: new Date('2020-01-01'),
        directorsNames: ['test director'],
        producersNames: ['test producer'],
        franchiseName: 'test franchise',
      });
    });

    describe("When the service's create method fails", () => {
      it('Should throw an InternalServerErrorException', async () => {
        const mockMoviesService = {
          create: jest.fn().mockRejectedValue(new Error('test error')),
        };
        const controller = await mockDependencies({ mockMoviesService });

        try {
          await controller.create(
            'test movie 1',
            'test opening crawl 1',
            '2020-01-01',
            ['test director'],
            ['test producer'],
            'test franchise',
          );
        } catch (error) {
          expect(error.message).toEqual('Error creating movie');
          expect(error.status).toEqual(500);
          expect(error).toBeInstanceOf(InternalServerErrorException);
        }
      });
    });
  });

  describe('getOne method', () => {
    it('Should return a movie', async () => {
      const expectedResult = getMockMovie(1);
      const mockMoviesService = {
        getOne: jest.fn().mockResolvedValue(expectedResult),
      };
      const controller = await mockDependencies({ mockMoviesService });

      const result = await controller.getOne('1');

      expect(result).toEqual(expectedResult);
    });

    it("Should call the service's getOne method with the correct params", async () => {
      const mockMoviesService = {
        getOne: jest.fn().mockResolvedValue([]),
      };
      const controller = await mockDependencies({ mockMoviesService });

      await controller.getOne('1');

      expect(mockMoviesService.getOne).toHaveBeenCalledWith(1);
    });

    describe("When the service's getOne method fails", () => {
      it('Should throw an InternalServerErrorException', async () => {
        const mockMoviesService = {
          getOne: jest.fn().mockRejectedValue(new Error('test error')),
        };
        const controller = await mockDependencies({ mockMoviesService });

        try {
          await controller.getOne('1');
        } catch (error) {
          expect(error.message).toEqual('Error getting movie');
          expect(error.status).toEqual(500);
          expect(error).toBeInstanceOf(InternalServerErrorException);
        }
      });
    });
  });

  describe('update method', () => {
    it('Should return an updated movie', async () => {
      const expectedResult = getMockMovie(1);
      const mockMoviesService = {
        update: jest.fn().mockResolvedValue(expectedResult),
      };
      const controller = await mockDependencies({ mockMoviesService });

      const result = await controller.update(
        '1',
        'test movie 1',
        'test opening crawl 1',
        '2020-01-01',
        ['test director'],
        ['test producer'],
        'test franchise',
      );

      expect(result).toEqual(expectedResult);
    });

    it("Should call the service's update method with the correct params", async () => {
      const mockMoviesService = {
        update: jest.fn().mockResolvedValue([]),
      };
      const controller = await mockDependencies({ mockMoviesService });

      await controller.update(
        '1',
        'test movie 1',
        'test opening crawl 1',
        '2020-01-01',
        ['test director'],
        ['test producer'],
        'test franchise',
      );

      expect(mockMoviesService.update).toHaveBeenCalledWith({
        id: 1,
        title: 'test movie 1',
        openingCrawl: 'test opening crawl 1',
        releaseDate: new Date('2020-01-01'),
        directorsNames: ['test director'],
        producersNames: ['test producer'],
        franchiseName: 'test franchise',
      });
    });

    describe("When the service's update method fails", () => {
      it('Should throw an InternalServerErrorException', async () => {
        const mockMoviesService = {
          update: jest.fn().mockRejectedValue(new Error('test error')),
        };
        const controller = await mockDependencies({ mockMoviesService });

        try {
          await controller.update(
            '1',
            'test movie 1',
            'test opening crawl 1',
            '2020-01-01',
            ['test director'],
            ['test producer'],
            'test franchise',
          );
        } catch (error) {
          expect(error.message).toEqual('Error updating movie');
          expect(error.status).toEqual(500);
          expect(error).toBeInstanceOf(InternalServerErrorException);
        }
      });
    });
  });

  describe('delete method', () => {
    it('Should return a delete response', async () => {
      const expectedResult = {
        message: `Movie with id 1 was deleted successfully`,
        status: 'success',
      };
      const mockMoviesService = {
        delete: jest.fn().mockResolvedValue(expectedResult),
      };
      const controller = await mockDependencies({ mockMoviesService });

      const result = await controller.delete('1');

      expect(result).toEqual(expectedResult);
    });

    it("Should call the service's delete method with the correct params", async () => {
      const mockMoviesService = {
        delete: jest.fn().mockResolvedValue([]),
      };
      const controller = await mockDependencies({ mockMoviesService });

      await controller.delete('1');

      expect(mockMoviesService.delete).toHaveBeenCalledWith(1);
    });

    describe("When the service's delete method fails", () => {
      it('Should throw an InternalServerErrorException', async () => {
        const mockMoviesService = {
          delete: jest.fn().mockRejectedValue(new Error('test error')),
        };
        const controller = await mockDependencies({ mockMoviesService });

        try {
          await controller.delete('1');
        } catch (error) {
          expect(error.message).toEqual('Error deleting movie');
          expect(error.status).toEqual(500);
          expect(error).toBeInstanceOf(InternalServerErrorException);
        }
      });
    });
  });

  describe('seedData method', () => {
    it('Should return an array of movies', async () => {
      const expectedResult = [getMockMovie(1), getMockMovie(2)];
      const mockMoviesService = {
        seedData: jest.fn().mockResolvedValue(expectedResult),
      };
      const controller = await mockDependencies({ mockMoviesService });

      const result = await controller.seedData();

      expect(result).toEqual(expectedResult);
    });

    it("Should call the service's seedData method with the correct params", async () => {
      const mockMoviesService = {
        seedData: jest.fn().mockResolvedValue([]),
      };
      const controller = await mockDependencies({ mockMoviesService });

      await controller.seedData();

      expect(mockMoviesService.seedData).toHaveBeenCalled();
    });

    describe("When the service's seedData method fails", () => {
      it('Should throw an InternalServerErrorException', async () => {
        const mockMoviesService = {
          seedData: jest.fn().mockRejectedValue(new Error('test error')),
        };
        const controller = await mockDependencies({ mockMoviesService });

        try {
          await controller.seedData();
        } catch (error) {
          expect(error.message).toEqual('Error seeding data');
          expect(error.status).toEqual(500);
          expect(error).toBeInstanceOf(InternalServerErrorException);
        }
      });
    });
  });
});
