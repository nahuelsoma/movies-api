import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RoleEnum, User } from 'src/repositories/users/types';
import { UsersService } from '.';
import { UsersRepository } from 'src/repositories/users';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

const moduleMocker = new ModuleMocker(global);

describe('UsersService', () => {
  const mockDependencies = async ({ mockUsersRepository }) => {
    const moduleRef = await Test.createTestingModule({
      providers: [UsersService],
    })
      .useMocker((token) => {
        if (token === UsersRepository) {
          return mockUsersRepository;
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

    return moduleRef.get(UsersService);
  };

  const mockUser: User = {
    id: 1,
    name: 'test user',
    email: 'test@test.com',
    password: 'test password',
    role: {
      name: RoleEnum.REGULAR,
    },
  };

  describe('create method', () => {
    it('Should return a user', async () => {
      const mockUsersRepository = {
        create: jest.fn().mockResolvedValue(mockUser),
      };
      const service = await mockDependencies({ mockUsersRepository });

      const result = await service.create({
        name: 'test user',
        email: 'test@test.com',
        password: 'test password',
        role: RoleEnum.REGULAR,
      });

      expect(result).toEqual(mockUser);
    });

    it("Should call the repository's create method with the correct params", async () => {
      const mockUsersRepository = {
        create: jest.fn().mockResolvedValue(mockUser),
      };
      const controller = await mockDependencies({ mockUsersRepository });

      await controller.create({
        name: 'test user',
        email: 'test@test.com',
        password: 'test password',
        role: RoleEnum.REGULAR,
      });

      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        name: 'test user',
        email: 'test@test.com',
        password: 'test password',
        role: RoleEnum.REGULAR,
      });
    });
  });

  describe('getOne method', () => {
    it('Should return a user', async () => {
      const mockUsersRepository = {
        findOne: jest.fn().mockResolvedValue(mockUser),
      };
      const service = await mockDependencies({ mockUsersRepository });

      const result = await service.getOne({
        id: 1,
      });

      expect(result).toEqual(mockUser);
    });

    it("Should call the repository's findOne method with the correct params", async () => {
      const mockUsersRepository = {
        findOne: jest.fn().mockResolvedValue(mockUser),
      };
      const controller = await mockDependencies({ mockUsersRepository });

      await controller.getOne({
        id: 1,
        email: 'test@test.com',
        isLogin: true,
        favorites: true,
      });

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        id: 1,
        email: 'test@test.com',
        isLogin: true,
        favorites: true,
      });
    });

    describe('When neither id nor email are provided', () => {
      it('Should throw a BadRequestException with the correct message', async () => {
        const mockUsersRepository = {
          findOne: jest.fn().mockResolvedValue(mockUser),
        };
        const service = await mockDependencies({ mockUsersRepository });

        try {
          await service.getOne({
            id: undefined,
            email: undefined,
          });
        } catch (error) {
          expect(error.message).toEqual('id or email must be provided.');
          expect(error.status).toEqual(400);
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
    });

    describe("When the repository's findOne method fails", () => {
      describe('And the error is a PrismaClientKnownRequestError', () => {
        it('Should throw a PrismaClientKnownRequestError with the correct message and code', async () => {
          const mockUsersRepository = {
            findOne: jest.fn().mockRejectedValue(
              new PrismaClientKnownRequestError('test error', {
                clientVersion: 'test client version',
                code: 'test code',
              }),
            ),
          };
          const service = await mockDependencies({
            mockUsersRepository,
          });

          try {
            await service.getOne({
              id: 1,
              email: 'test@test.com',
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
          const mockUsersRepository = {
            findOne: jest.fn().mockRejectedValue(
              new PrismaClientValidationError('test error', {
                clientVersion: 'test client version',
              }),
            ),
          };
          const service = await mockDependencies({
            mockUsersRepository,
          });

          try {
            await service.getOne({
              id: 1,
              email: 'test@test.com',
            });
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientValidationError);
            expect(error.message).toBe('test error');
          }
        });
      });

      describe('And the error is a HttpException', () => {
        it('Should throw a HttpException with the correct message and status', async () => {
          const mockUsersRepository = {
            findOne: jest
              .fn()
              .mockRejectedValue(new HttpException('test error', 400)),
          };
          const service = await mockDependencies({
            mockUsersRepository,
          });

          try {
            await service.getOne({
              id: 1,
              email: 'test@test.com',
            });
          } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.message).toBe('test error');
            expect(error.status).toBe(400);
          }
        });
      });

      describe('And the error is not a PrismaClientKnownRequestError, PrismaClientValidationError or HttpException', () => {
        it('Should throw an InternalServerErrorException with the correct message', async () => {
          const mockUsersRepository = {
            findOne: jest.fn().mockRejectedValue(new Error('test error')),
          };
          const service = await mockDependencies({ mockUsersRepository });

          try {
            await service.getOne({
              id: 1,
              email: 'test@test.com',
            });
          } catch (error) {
            expect(error.message).toEqual(
              'Error getting user. Please try again later.',
            );
            expect(error.status).toEqual(500);
            expect(error).toBeInstanceOf(InternalServerErrorException);
          }
        });
      });
    });
  });
});
