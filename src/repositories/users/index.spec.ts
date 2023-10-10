import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Test } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from '.';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { Database } from 'src/infrastructure/database';
import { RoleEnum, User } from './types';

const moduleMocker = new ModuleMocker(global);

describe('UsersRepository', () => {
  const mockDependencies = async ({ database }) => {
    const moduleRef = await Test.createTestingModule({
      providers: [UsersRepository],
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

    return moduleRef.get(UsersRepository);
  };

  const mockUser: User = {
    id: 3,
    name: 'Test User',
    email: 'test@test.com',
    password: 'test password',
    role: { name: RoleEnum.REGULAR },
  };

  describe('create method', () => {
    it('Should return the created user', async () => {
      const database = {
        user: {
          create: jest.fn().mockResolvedValue(mockUser),
        },
      };
      const provider = await mockDependencies({ database });

      const result = await provider.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'test password',
        role: RoleEnum.REGULAR,
      });

      expect(result).toEqual(mockUser);
    });

    it("Should call the repository's create method with the correct params", async () => {
      const database = {
        user: {
          create: jest.fn().mockResolvedValue(mockUser),
        },
      };
      const provider = await mockDependencies({ database });

      await provider.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'test password',
        role: RoleEnum.REGULAR,
      });

      expect(database.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Test User',
          email: 'test@test.com',
          password: 'test password',
          role: {
            connectOrCreate: {
              where: {
                name: RoleEnum.REGULAR,
              },
              create: {
                name: RoleEnum.REGULAR,
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      });
    });

    describe('When the database throws an error', () => {
      describe('And the error is a PrismaClientKnownRequestError', () => {
        it('Should throw a PrismaClientKnownRequestError with the correct message and code', async () => {
          const database = {
            user: {
              create: jest.fn().mockRejectedValue(
                new PrismaClientKnownRequestError('test error', {
                  clientVersion: 'test client version',
                  code: 'test code',
                }),
              ),
            },
          };
          const provider = await mockDependencies({ database });

          try {
            await provider.create({
              name: 'Test User',
              email: 'test@test.com',
              password: 'test password',
              role: RoleEnum.REGULAR,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
            expect(error.message).toBe('test error');
            expect(error.code).toBe('test code');
          }
        });
      });
    });

    describe('And the error is a PrismaClientValidationError', () => {
      it('Should throw a PrismaClientValidationError with the correct message', async () => {
        const database = {
          user: {
            create: jest.fn().mockRejectedValue(
              new PrismaClientValidationError('test error', {
                clientVersion: 'test client version',
              }),
            ),
          },
        };
        const provider = await mockDependencies({ database });

        try {
          await provider.create({
            name: 'Test User',
            email: 'test@test.com',
            password: 'test password',
            role: RoleEnum.REGULAR,
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
          user: {
            create: jest.fn().mockRejectedValue(new Error('test error')),
          },
        };
        const provider = await mockDependencies({ database });

        try {
          await provider.create({
            name: 'Test User',
            email: 'test@test.com',
            password: 'test password',
            role: RoleEnum.REGULAR,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe('Error creating user');
        }
      });
    });
  });

  describe('findOne method', () => {
    describe('When the user exists', () => {
      it('Should return the user', async () => {
        const database = {
          user: {
            findUnique: jest.fn().mockResolvedValue(mockUser),
          },
        };
        const provider = await mockDependencies({ database });

        const result = await provider.findOne({
          id: 3,
          email: 'test@test.com',
          favorites: false,
          isLogin: true,
        });

        expect(result).toEqual(mockUser);
      });
    });

    describe("When the user doesn't exist", () => {
      it('Should return null', async () => {
        const database = {
          user: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        const provider = await mockDependencies({ database });

        const result = await provider.findOne({
          id: 3,
          email: 'test@test.com',
          favorites: false,
          isLogin: true,
        });

        expect(result).toBeNull();
      });
    });

    describe('When the database throws an error', () => {
      describe('And the error is a PrismaClientKnownRequestError', () => {
        it('Should throw a PrismaClientKnownRequestError with the correct message and code', async () => {
          const database = {
            user: {
              findUnique: jest.fn().mockRejectedValue(
                new PrismaClientKnownRequestError('test error', {
                  clientVersion: 'test client version',
                  code: 'test code',
                }),
              ),
            },
          };
          const provider = await mockDependencies({ database });

          try {
            await provider.findOne({
              id: 3,
              email: 'test@test.com',
              favorites: false,
              isLogin: true,
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
            user: {
              findUnique: jest.fn().mockRejectedValue(
                new PrismaClientValidationError('test error', {
                  clientVersion: 'test client version',
                }),
              ),
            },
          };
          const provider = await mockDependencies({ database });

          try {
            await provider.findOne({
              id: 3,
              email: 'test@test.com',
              favorites: false,
              isLogin: true,
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
            user: {
              findUnique: jest.fn().mockRejectedValue(new Error('test error')),
            },
          };
          const provider = await mockDependencies({ database });

          try {
            await provider.findOne({
              id: 3,
              email: 'test@test.com',
              favorites: false,
              isLogin: true,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(InternalServerErrorException);
            expect(error.message).toBe('Error finding user');
          }
        });
      });
    });
  });
});
