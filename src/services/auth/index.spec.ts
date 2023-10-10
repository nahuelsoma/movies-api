import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Test } from '@nestjs/testing';
import {
  HttpException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RoleEnum, User } from 'src/repositories/users/types';
import { AuthService } from '.';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { UsersService } from '../users';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from './types';
import * as bcrypt from 'bcrypt';

const moduleMocker = new ModuleMocker(global);

describe('AuthService', () => {
  const mockDependencies = async ({ mockUsersService, mockJwtService }) => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return mockUsersService;
        }
        if (token === JwtService) {
          return mockJwtService;
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

    return moduleRef.get(AuthService);
  };

  describe('login method', () => {
    const mockUser: User = {
      id: 1,
      name: 'test user',
      email: 'test@test.com',
      password: 'test password',
      role: {
        name: RoleEnum.REGULAR,
      },
    };

    const jwtPayload: JWTPayload = {
      id: 1,
      email: 'test@test.com',
      role: RoleEnum.REGULAR,
    };

    it('Should return an access token', async () => {
      const mockAuthToken = {
        access_token: 'test access token',
      };

      const mockUsersService = {
        getOne: jest.fn().mockResolvedValue(mockUser),
      };
      const mockJwtService = {
        signAsync: jest.fn().mockResolvedValue('test access token'),
      };
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const provider = await mockDependencies({
        mockUsersService,
        mockJwtService,
      });

      const result = await provider.login({
        email: 'test@test.com',
        password: 'test password',
      });

      expect(result).toEqual(mockAuthToken);
    });

    it("Should call the service's login method, the jwtService's signAsync method and the bcrypt's compare method with the correct params", async () => {
      const mockUsersService = {
        getOne: jest.fn().mockResolvedValue(mockUser),
      };
      const mockJwtService = {
        signAsync: jest.fn().mockResolvedValue('test access token'),
      };
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      const provider = await mockDependencies({
        mockUsersService,
        mockJwtService,
      });

      await provider.login({
        email: 'test@test.com',
        password: 'test password',
      });

      expect(mockUsersService.getOne).toHaveBeenCalledWith({
        email: 'test@test.com',
        isLogin: true,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'test password',
        'test password',
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(jwtPayload);
    });

    describe("When the user doesn't exist or the password is invalid", () => {
      it('Should throw a UnauthorizedException', async () => {
        const mockUsersService = {
          getOne: jest.fn().mockResolvedValue(null),
        };
        const mockJwtService = {
          signAsync: jest.fn().mockResolvedValue('test access token'),
        };
        jest
          .spyOn(bcrypt, 'compare')
          .mockImplementation(() => Promise.resolve(false));

        const provider = await mockDependencies({
          mockUsersService,
          mockJwtService,
        });

        try {
          await provider.login({
            email: 'test@test.com',
            password: 'test password',
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toBe('Invalid email or password');
        }
      });
    });

    describe('When the user service throws an error', () => {
      describe('When the error is a PrismaClientKnownRequestError', () => {
        it('Should throw a PrismaClientKnownRequestError with the correct message and code', async () => {
          const mockUsersService = {
            getOne: jest.fn().mockRejectedValue(
              new PrismaClientKnownRequestError('test error', {
                clientVersion: 'test client version',
                code: 'test code',
              }),
            ),
          };
          const mockJwtService = {
            signAsync: jest.fn().mockResolvedValue('test access token'),
          };
          jest
            .spyOn(bcrypt, 'compare')
            .mockImplementation(() => Promise.resolve(true));
          const provider = await mockDependencies({
            mockUsersService,
            mockJwtService,
          });

          try {
            await provider.login({
              email: 'test@test.com',
              password: 'test password',
            });
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
            expect(error.message).toBe('test error');
            expect(error.code).toBe('test code');
          }
        });
      });

      describe('When the error is a PrismaClientValidationError', () => {
        it('Should throw a PrismaClientValidationError with the correct message', async () => {
          const mockUsersService = {
            getOne: jest.fn().mockRejectedValue(
              new PrismaClientValidationError('test error', {
                clientVersion: 'test client version',
              }),
            ),
          };
          const mockJwtService = {
            signAsync: jest.fn().mockResolvedValue('test access token'),
          };
          jest
            .spyOn(bcrypt, 'compare')
            .mockImplementation(() => Promise.resolve(true));
          const provider = await mockDependencies({
            mockUsersService,
            mockJwtService,
          });

          try {
            await provider.login({
              email: 'test@test.com',
              password: 'test password',
            });
          } catch (error) {
            expect(error).toBeInstanceOf(PrismaClientValidationError);
            expect(error.message).toBe('test error');
          }
        });
      });

      describe('When the error is an HttpException', () => {
        it('Should throw an HttpException with the correct message and status', async () => {
          const mockUsersService = {
            getOne: jest
              .fn()
              .mockRejectedValue(new HttpException('test error', 400)),
          };
          const mockJwtService = {
            signAsync: jest.fn().mockResolvedValue('test access token'),
          };
          jest
            .spyOn(bcrypt, 'compare')
            .mockImplementation(() => Promise.resolve(true));
          const provider = await mockDependencies({
            mockUsersService,
            mockJwtService,
          });

          try {
            await provider.login({
              email: 'test@test.com',
              password: 'test password',
            });
          } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.message).toBe('test error');
            expect(error.status).toBe(400);
          }
        });
      });

      describe('When the error is an unknown error', () => {
        it('Should throw an InternalServerErrorException', async () => {
          const mockUsersService = {
            getOne: jest.fn().mockRejectedValue(new Error('test error')),
          };
          const mockJwtService = {
            signAsync: jest.fn().mockResolvedValue('test access token'),
          };
          jest
            .spyOn(bcrypt, 'compare')
            .mockImplementation(() => Promise.resolve(true));
          const provider = await mockDependencies({
            mockUsersService,
            mockJwtService,
          });

          try {
            await provider.login({
              email: 'test@test.com',
              password: 'test password',
            });
          } catch (error) {
            expect(error).toBeInstanceOf(InternalServerErrorException);
            expect(error.message).toBe(
              'Error logging in. Please try again later.',
            );
          }
        });
      });
    });
  });

  describe('signUp method', () => {
    const mockUser = {
      id: 1,
      name: 'test user',
      email: 'test@test.com',
      role: {
        name: RoleEnum.REGULAR,
      },
    };

    it('Should return the created user', async () => {
      const mockUsersService = {
        create: jest.fn().mockResolvedValue(mockUser),
      };
      const mockJwtService = jest.fn();
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashed password'));

      const provider = await mockDependencies({
        mockUsersService,
        mockJwtService,
      });

      const result = await provider.signUp({
        name: 'test user',
        email: 'test@test.com',
        password: 'test password',
        role: RoleEnum.REGULAR,
      });

      expect(result).toEqual(mockUser);
    });

    it("Should call the service's create method and the bcrypt's hash method with the correct params", async () => {
      const mockUsersService = {
        create: jest.fn().mockResolvedValue(mockUser),
      };
      const mockJwtService = jest.fn();
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashed password'));

      const provider = await mockDependencies({
        mockUsersService,
        mockJwtService,
      });

      await provider.signUp({
        name: 'test user',
        email: 'test@test.com',
        password: 'test password',
        role: RoleEnum.REGULAR,
      });

      expect(mockUsersService.create).toHaveBeenCalledWith({
        name: 'test user',
        email: 'test@test.com',
        password: 'hashed password',
        role: RoleEnum.REGULAR,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('test password', 10);
    });

    describe('When the user service throws an error', () => {
      describe('When the error is a PrismaClientKnownRequestError', () => {
        it('Should throw a PrismaClientKnownRequestError with the correct message and code', async () => {
          const mockUsersService = {
            create: jest.fn().mockRejectedValue(
              new PrismaClientKnownRequestError('test error', {
                clientVersion: 'test client version',
                code: 'test code',
              }),
            ),
          };
          const mockJwtService = jest.fn();
          jest
            .spyOn(bcrypt, 'hash')
            .mockImplementation(() => Promise.resolve('hashed password'));
          const provider = await mockDependencies({
            mockUsersService,
            mockJwtService,
          });

          try {
            await provider.signUp({
              name: 'test user',
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

      describe('When the error is a PrismaClientValidationError', () => {
        it('Should throw a PrismaClientValidationError with the correct message', async () => {
          const mockUsersService = {
            create: jest.fn().mockRejectedValue(
              new PrismaClientValidationError('test error', {
                clientVersion: 'test client version',
              }),
            ),
          };
          const mockJwtService = jest.fn();
          jest
            .spyOn(bcrypt, 'hash')
            .mockImplementation(() => Promise.resolve('hashed password'));
          const provider = await mockDependencies({
            mockUsersService,
            mockJwtService,
          });

          try {
            await provider.signUp({
              name: 'test user',
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

      describe('When the error is an HttpException', () => {
        it('Should throw an HttpException with the correct message and status', async () => {
          const mockUsersService = {
            create: jest
              .fn()
              .mockRejectedValue(new HttpException('test error', 400)),
          };
          const mockJwtService = jest.fn();
          jest
            .spyOn(bcrypt, 'hash')
            .mockImplementation(() => Promise.resolve('hashed password'));
          const provider = await mockDependencies({
            mockUsersService,
            mockJwtService,
          });

          try {
            await provider.signUp({
              name: 'test user',
              email: 'test@test.com',
              password: 'test password',
              role: RoleEnum.REGULAR,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.message).toBe('test error');
            expect(error.status).toBe(400);
          }
        });
      });

      describe('When the error is an unknown error', () => {
        it('Should throw an InternalServerErrorException', async () => {
          const mockUsersService = {
            create: jest.fn().mockRejectedValue(new Error('test error')),
          };
          const mockJwtService = jest.fn();
          jest
            .spyOn(bcrypt, 'hash')
            .mockImplementation(() => Promise.resolve('hashed password'));
          const provider = await mockDependencies({
            mockUsersService,
            mockJwtService,
          });

          try {
            await provider.signUp({
              name: 'test user',
              email: 'test@test.com',
              password: 'test password',
              role: RoleEnum.REGULAR,
            });
          } catch (error) {
            expect(error).toBeInstanceOf(InternalServerErrorException);
            expect(error.message).toBe(
              'Error signing up. Please try again later.',
            );
          }
        });
      });
    });
  });
});
