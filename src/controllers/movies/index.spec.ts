import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { MoviesController } from '.';
import { Test } from '@nestjs/testing';
import { MoviesService } from 'src/services/movies';
import { Movie } from 'src/repositories/movies/types';

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

  const getMockMovie = (id: number): Movie => ({
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
    franchise: {
      id: 1,
      name: 'test franchise',
    },
  });

  describe('getAll method', () => {
    it('Should return an array of movies', async () => {
      const expectedResult = [getMockMovie(1), getMockMovie(2)];
      const mockMoviesService = {
        getAll: jest.fn().mockResolvedValue(expectedResult),
      };
      const controller = await mockDependencies({ mockMoviesService });

      const result = await controller.getAll({
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual(expectedResult);
    });

    it("Should call the service's getAll method with the correct params", async () => {
      const mockMoviesService = {
        getAll: jest.fn().mockResolvedValue([]),
      };
      const controller = await mockDependencies({ mockMoviesService });

      await controller.getAll({
        limit: 10,
        offset: 0,
      });

      expect(mockMoviesService.getAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
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

      const result = await controller.create({
        title: 'test movie 1',
        opening_crawl: 'test opening crawl 1',
        release_date: '2020-01-01',
        directors_names: ['test director'],
        producers_names: ['test producer'],
        franchise_name: 'test franchise',
      });

      expect(result).toEqual(expectedResult);
    });

    it("Should call the service's create method with the correct params", async () => {
      const mockMoviesService = {
        create: jest.fn().mockResolvedValue([]),
      };
      const controller = await mockDependencies({ mockMoviesService });

      await controller.create({
        title: 'test movie 1',
        opening_crawl: 'test opening crawl 1',
        release_date: '2020-01-01',
        directors_names: ['test director'],
        producers_names: ['test producer'],
        franchise_name: 'test franchise',
      });

      expect(mockMoviesService.create).toHaveBeenCalledWith({
        title: 'test movie 1',
        openingCrawl: 'test opening crawl 1',
        releaseDate: new Date('2020-01-01'),
        directorsNames: ['test director'],
        producersNames: ['test producer'],
        franchiseName: 'test franchise',
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

      const result = await controller.getOne({ id: 1 });

      expect(result).toEqual(expectedResult);
    });

    it("Should call the service's getOne method with the correct params", async () => {
      const mockMoviesService = {
        getOne: jest.fn().mockResolvedValue([]),
      };
      const controller = await mockDependencies({ mockMoviesService });

      await controller.getOne({ id: 1 });

      expect(mockMoviesService.getOne).toHaveBeenCalledWith(1);
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
        {
          id: 1,
        },
        {
          title: 'test movie 1',
          opening_crawl: 'test opening crawl 1',
          release_date: '2020-01-01',
          directors_names: ['test director'],
          producers_names: ['test producer'],
          franchise_name: 'test franchise',
        },
      );

      expect(result).toEqual(expectedResult);
    });

    it("Should call the service's update method with the correct params", async () => {
      const mockMoviesService = {
        update: jest.fn().mockResolvedValue([]),
      };
      const controller = await mockDependencies({ mockMoviesService });

      await controller.update(
        {
          id: 1,
        },
        {
          title: 'test movie 1',
          opening_crawl: 'test opening crawl 1',
          release_date: '2020-01-01',
          directors_names: ['test director'],
          producers_names: ['test producer'],
          franchise_name: 'test franchise',
        },
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

      const result = await controller.delete({ id: 1 });

      expect(result).toEqual(expectedResult);
    });

    it("Should call the service's delete method with the correct params", async () => {
      const mockMoviesService = {
        delete: jest.fn().mockResolvedValue([]),
      };
      const controller = await mockDependencies({ mockMoviesService });

      await controller.delete({ id: 1 });

      expect(mockMoviesService.delete).toHaveBeenCalledWith(1);
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
  });
});
