import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Test } from '@nestjs/testing';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MoviesRepository } from '.';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { Database } from 'src/infrastructure/database';
import { Movie } from './types';

const moduleMocker = new ModuleMocker(global);

describe('MoviesRepository', () => {
  const mockDependencies = async ({ database }) => {
    const moduleRef = await Test.createTestingModule({
      providers: [MoviesRepository],
    })
      .useMocker((token) => {
        if (token === Database) {
          return database;
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

    return moduleRef.get(MoviesRepository);
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
      const database = {
        movie: {
          create: jest.fn().mockResolvedValue(mockMovie),
        },
      };
      const controller = await mockDependencies({ database });

      const result = await controller.create({
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
      const database = {
        movie: {
          create: jest.fn().mockResolvedValue(mockMovie),
        },
      };
      const controller = await mockDependencies({ database });

      await controller.create({
        title: 'test movie',
        openingCrawl: 'test opening crawl',
        releaseDate: new Date('2021-01-01'),
        directorsNames: ['test director'],
        producersNames: ['test producer'],
        franchiseName: 'test franchise name',
      });

      expect(database.movie.create).toHaveBeenCalledWith({
        data: {
          title: 'test movie',
          opening_crawl: 'test opening crawl',
          release_date: new Date('2021-01-01'),
          directors: {
            connectOrCreate: [
              {
                where: { name: 'test director' },
                create: { name: 'test director' },
              },
            ],
          },
          producers: {
            connectOrCreate: [
              {
                where: { name: 'test producer' },
                create: { name: 'test producer' },
              },
            ],
          },
          franchise: {
            connectOrCreate: {
              where: { name: 'test franchise name' },
              create: { name: 'test franchise name' },
            },
          },
        },
        select: {
          id: true,
          title: true,
          opening_crawl: true,
          release_date: true,
          directors: {
            select: {
              name: true,
              id: true,
            },
          },
          producers: {
            select: {
              name: true,
              id: true,
            },
          },
          franchise: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
    });

    describe('When the database throws an error', () => {
      describe('And the error is a PrismaClientKnownRequestError', () => {
        it('Should throw a PrismaClientKnownRequestError with the correct message and code', async () => {
          const database = {
            movie: {
              create: jest.fn().mockRejectedValue(
                new PrismaClientKnownRequestError('test error', {
                  clientVersion: 'test client version',
                  code: 'test code',
                }),
              ),
            },
          };
          const controller = await mockDependencies({ database });

          try {
            await controller.create({
              title: 'test movie',
              openingCrawl: 'test opening crawl',
              releaseDate: new Date('2021-01-01'),
              directorsNames: ['test director'],
              producersNames: ['test producer'],
              franchiseName: 'test franchise name',
            });
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
            expect(error.message).toBe('test error');
            expect(error.code).toBe('test code');
          }
        });
      });

      describe('And the error is a PrismaClientValidationError', () => {
        it('Should throw a PrismaClientValidationError with the correct message', async () => {
          const database = {
            movie: {
              create: jest.fn().mockRejectedValue(
                new PrismaClientValidationError('test error', {
                  clientVersion: 'test client version',
                }),
              ),
            },
          };
          const controller = await mockDependencies({ database });

          try {
            await controller.create({
              title: 'test movie',
              openingCrawl: 'test opening crawl',
              releaseDate: new Date('2021-01-01'),
              directorsNames: ['test director'],
              producersNames: ['test producer'],
              franchiseName: 'test franchise name',
            });
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientValidationError);
            expect(error.message).toBe('test error');
          }
        });
      });

      describe('And the error is an unknown error', () => {
        it('Should throw an InternalServerErrorException', async () => {
          const database = {
            movie: {
              create: jest.fn().mockRejectedValue(new Error('test error')),
            },
          };
          const controller = await mockDependencies({ database });

          try {
            await controller.create({
              title: 'test movie',
              openingCrawl: 'test opening crawl',
              releaseDate: new Date('2021-01-01'),
              directorsNames: ['test director'],
              producersNames: ['test producer'],
              franchiseName: 'test franchise name',
            });
          } catch (error) {
            expect(error).toBeInstanceOf(InternalServerErrorException);
            expect(error.message).toBe('Error creating movie');
          }
        });
      });
    });
  });

  describe('delete method', () => {
    describe('When the movie exists', () => {
      it('Should return the deleted movie', async () => {
        const database = {
          movie: {
            delete: jest.fn().mockResolvedValue(mockMovie),
          },
        };
        const controller = await mockDependencies({ database });

        const result = await controller.delete(1);

        expect(result).toEqual(mockMovie);
      });
    });

    describe("When the movie doesn't exist", () => {
      it('Should return null', async () => {
        const database = {
          movie: {
            delete: jest.fn().mockResolvedValue(null),
          },
        };
        const controller = await mockDependencies({ database });

        const result = await controller.delete(1);

        expect(result).toBeNull();
      });
    });

    it("Should call the repository's delete method with the correct params", async () => {
      const database = {
        movie: {
          delete: jest.fn().mockResolvedValue(mockMovie),
        },
      };
      const controller = await mockDependencies({ database });

      await controller.delete(1);

      expect(database.movie.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          title: true,
          opening_crawl: true,
          release_date: true,
          directors: {
            select: {
              name: true,
              id: true,
            },
          },
          producers: {
            select: {
              name: true,
              id: true,
            },
          },
          franchise: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
    });

    describe('When the database throws an error', () => {
      describe('And the error is a PrismaClientKnownRequestError', () => {
        it('Should throw a PrismaClientKnownRequestError with the correct message and code', async () => {
          const database = {
            movie: {
              delete: jest.fn().mockRejectedValue(
                new PrismaClientKnownRequestError('test error', {
                  clientVersion: 'test client version',
                  code: 'test code',
                }),
              ),
            },
          };
          const controller = await mockDependencies({ database });

          try {
            await controller.delete(1);
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
            expect(error.message).toBe('test error');
            expect(error.code).toBe('test code');
          }
        });
      });

      describe('And the error is a PrismaClientValidationError', () => {
        it('Should throw a PrismaClientValidationError with the correct message', async () => {
          const database = {
            movie: {
              delete: jest.fn().mockRejectedValue(
                new PrismaClientValidationError('test error', {
                  clientVersion: 'test client version',
                }),
              ),
            },
          };
          const controller = await mockDependencies({ database });

          try {
            await controller.delete(1);
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientValidationError);
            expect(error.message).toBe('test error');
          }
        });
      });

      describe('And the error is an unknown error', () => {
        it('Should throw an InternalServerErrorException', async () => {
          const database = {
            movie: {
              delete: jest.fn().mockRejectedValue(new Error('test error')),
            },
          };
          const controller = await mockDependencies({ database });

          try {
            await controller.delete(1);
          } catch (error) {
            expect(error).toBeInstanceOf(InternalServerErrorException);
            expect(error.message).toBe('Error deleting movie with id 1');
          }
        });
      });
    });
  });

  describe('findAll method', () => {
    it('Should return the movies', async () => {
      const database = {
        movie: {
          findMany: jest.fn().mockResolvedValue([mockMovie]),
        },
      };
      const controller = await mockDependencies({ database });

      const result = await controller.findAll({
        skip: 0,
        take: 10,
      });

      expect(result).toEqual([mockMovie]);
    });

    it("Should call the repository's findAll method with the correct params", async () => {
      const database = {
        movie: {
          findMany: jest.fn().mockResolvedValue([mockMovie]),
        },
      };
      const controller = await mockDependencies({ database });

      await controller.findAll({
        skip: 0,
        take: 10,
      });

      expect(database.movie.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        select: {
          id: true,
          title: true,
          opening_crawl: true,
          release_date: true,
          directors: {
            select: {
              name: true,
              id: true,
            },
          },
          producers: {
            select: {
              name: true,
              id: true,
            },
          },
          franchise: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
    });

    describe('When the database throws an error', () => {
      describe('And the error is a PrismaClientKnownRequestError', () => {
        it('Should throw a PrismaClientKnownRequestError with the correct message and code', async () => {
          const database = {
            movie: {
              findMany: jest.fn().mockRejectedValue(
                new PrismaClientKnownRequestError('test error', {
                  clientVersion: 'test client version',
                  code: 'test code',
                }),
              ),
            },
          };
          const controller = await mockDependencies({ database });

          try {
            await controller.findAll({
              skip: 0,
              take: 10,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
            expect(error.message).toBe('test error');
            expect(error.code).toBe('test code');
          }
        });
      });

      describe('And the error is a PrismaClientValidationError', () => {
        it('Should throw a PrismaClientValidationError with the correct message', async () => {
          const database = {
            movie: {
              findMany: jest.fn().mockRejectedValue(
                new PrismaClientValidationError('test error', {
                  clientVersion: 'test client version',
                }),
              ),
            },
          };
          const controller = await mockDependencies({ database });

          try {
            await controller.findAll({
              skip: 0,
              take: 10,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientValidationError);
            expect(error.message).toBe('test error');
          }
        });
      });

      describe('And the error is an unknown error', () => {
        it('Should throw an InternalServerErrorException', async () => {
          const database = {
            movie: {
              findMany: jest.fn().mockRejectedValue(new Error('test error')),
            },
          };
          const controller = await mockDependencies({ database });

          try {
            await controller.findAll({
              skip: 0,
              take: 10,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(InternalServerErrorException);
            expect(error.message).toBe('Error finding movies');
          }
        });
      });
    });
  });

  describe('findOne method', () => {
    describe('When the movie exists', () => {
      it('Should return the movie', async () => {
        const database = {
          movie: {
            findUnique: jest.fn().mockResolvedValue(mockMovie),
          },
        };
        const controller = await mockDependencies({ database });

        const result = await controller.findOne(1);

        expect(result).toEqual(mockMovie);
      });
    });

    describe("When the movie doesn't exist", () => {
      it('Should return null', async () => {
        const database = {
          movie: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        const controller = await mockDependencies({ database });

        const result = await controller.findOne(1);

        expect(result).toBeNull();
      });
    });

    it("Should call the repository's findOne method with the correct params", async () => {
      const database = {
        movie: {
          findUnique: jest.fn().mockResolvedValue(mockMovie),
        },
      };
      const controller = await mockDependencies({ database });

      await controller.findOne(1);

      expect(database.movie.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          title: true,
          opening_crawl: true,
          release_date: true,
          directors: {
            select: {
              name: true,
              id: true,
            },
          },
          producers: {
            select: {
              name: true,
              id: true,
            },
          },
          franchise: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
    });

    describe('When the database throws an error', () => {
      describe('And the error is a PrismaClientKnownRequestError', () => {
        it('Should throw a PrismaClientKnownRequestError with the correct message and code', async () => {
          const database = {
            movie: {
              findUnique: jest.fn().mockRejectedValue(
                new PrismaClientKnownRequestError('test error', {
                  clientVersion: 'test client version',
                  code: 'test code',
                }),
              ),
            },
          };
          const controller = await mockDependencies({ database });

          try {
            await controller.findOne(1);
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
            expect(error.message).toBe('test error');
            expect(error.code).toBe('test code');
          }
        });
      });

      describe('And the error is a PrismaClientValidationError', () => {
        it('Should throw a PrismaClientValidationError with the correct message', async () => {
          const database = {
            movie: {
              findUnique: jest.fn().mockRejectedValue(
                new PrismaClientValidationError('test error', {
                  clientVersion: 'test client version',
                }),
              ),
            },
          };
          const controller = await mockDependencies({ database });

          try {
            await controller.findOne(1);
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientValidationError);
            expect(error.message).toBe('test error');
          }
        });
      });

      describe('And the error is an unknown error', () => {
        it('Should throw an InternalServerErrorException', async () => {
          const database = {
            movie: {
              findUnique: jest.fn().mockRejectedValue(new Error('test error')),
            },
          };
          const controller = await mockDependencies({ database });

          try {
            await controller.findOne(1);
          } catch (error) {
            expect(error).toBeInstanceOf(InternalServerErrorException);
            expect(error.message).toBe('Error finding movie with id 1');
          }
        });
      });
    });
  });

  describe('update method', () => {
    describe('When the movie exists', () => {
      it('Should return the updated movie', async () => {
        const database = {
          movie: {
            update: jest.fn().mockResolvedValue(mockMovie),
          },
        };
        const controller = await mockDependencies({ database });

        const result = await controller.update({
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
    });

    describe("When the movie doesn't exist", () => {
      it('Should throw a NotFoundException', async () => {
        const database = {
          movie: {
            update: jest.fn().mockRejectedValue(
              new PrismaClientKnownRequestError('test error', {
                clientVersion: 'test client version',
                code: 'P2016',
              }),
            ),
          },
        };
        const controller = await mockDependencies({ database });

        try {
          await controller.update({
            id: 1,
            title: 'test movie',
            openingCrawl: 'test opening crawl',
            releaseDate: new Date('2021-01-01'),
            directorsNames: ['test director'],
            producersNames: ['test producer'],
            franchiseName: 'test franchise name',
          });
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toBe('Movie with id 1 not found');
        }
      });
    });

    describe('When the database throws an error', () => {
      describe('And the error is a PrismaClientKnownRequestError', () => {
        it('Should throw a PrismaClientKnownRequestError with the correct message and code', async () => {
          const database = {
            movie: {
              update: jest.fn().mockRejectedValue(
                new PrismaClientKnownRequestError('test error', {
                  clientVersion: 'test client version',
                  code: 'test code',
                }),
              ),
            },
          };
          const controller = await mockDependencies({ database });

          try {
            await controller.update({
              id: 1,
              title: 'test movie',
              openingCrawl: 'test opening crawl',
              releaseDate: new Date('2021-01-01'),
              directorsNames: ['test director'],
              producersNames: ['test producer'],
              franchiseName: 'test franchise name',
            });
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
            expect(error.message).toBe('test error');
            expect(error.code).toBe('test code');
          }
        });
      });

      describe('And the error is a PrismaClientValidationError', () => {
        it('Should throw a PrismaClientValidationError with the correct message', async () => {
          const database = {
            movie: {
              update: jest.fn().mockRejectedValue(
                new PrismaClientValidationError('test error', {
                  clientVersion: 'test client version',
                }),
              ),
            },
          };
          const controller = await mockDependencies({ database });

          try {
            await controller.update({
              id: 1,
              title: 'test movie',
              openingCrawl: 'test opening crawl',
              releaseDate: new Date('2021-01-01'),
              directorsNames: ['test director'],
              producersNames: ['test producer'],
              franchiseName: 'test franchise name',
            });
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientValidationError);
            expect(error.message).toBe('test error');
          }
        });
      });

      describe('And the error is an unknown error', () => {
        it('Should throw an InternalServerErrorException', async () => {
          const database = {
            movie: {
              update: jest.fn().mockRejectedValue(new Error('test error')),
            },
          };
          const controller = await mockDependencies({ database });

          try {
            await controller.update({
              id: 1,
              title: 'test movie',
              openingCrawl: 'test opening crawl',
              releaseDate: new Date('2021-01-01'),
              directorsNames: ['test director'],
              producersNames: ['test producer'],
              franchiseName: 'test franchise name',
            });
          } catch (error) {
            expect(error).toBeInstanceOf(InternalServerErrorException);
            expect(error.message).toBe('Error updating movie with id 1');
          }
        });
      });
    });
  });
});
