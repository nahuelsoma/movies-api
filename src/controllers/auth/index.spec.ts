import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { AuthController } from '.';
import { Test } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { AuthService } from 'src/services/auth';
import { RoleEnum } from 'src/repositories/users/types';

const moduleMocker = new ModuleMocker(global);

describe('AuthController', () => {
  const mockDependencies = async ({ mockAuthService }) => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === AuthService) {
          return mockAuthService;
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

    return moduleRef.get(AuthController);
  };

  describe('login method', () => {
    const mockAuthToken = {
      access_token: 'test access token',
    };

    it('Should return an access token', async () => {
      const mockAuthService = {
        login: jest.fn().mockResolvedValue(mockAuthToken),
      };
      const controller = await mockDependencies({ mockAuthService });

      const result = await controller.login('test@test.com', 'test password');

      expect(result).toEqual(mockAuthToken);
    });

    it("Should call the service's login method with the correct params", async () => {
      const mockAuthService = {
        login: jest.fn().mockResolvedValue(mockAuthToken),
      };
      const controller = await mockDependencies({ mockAuthService });

      await controller.login('test@test.com', 'test password');

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'test password',
      });
    });

    describe("When the service's login method fails", () => {
      it('Should throw an InternalServerErrorException', async () => {
        const mockAuthService = {
          login: jest.fn().mockRejectedValue(new Error('test error')),
        };
        const controller = await mockDependencies({ mockAuthService });

        try {
          await controller.login('test@test.com', 'test password');
        } catch (error) {
          expect(error.message).toEqual('Error logging in');
          expect(error.status).toEqual(500);
          expect(error).toBeInstanceOf(InternalServerErrorException);
        }
      });
    });
  });

  describe('signUp method', () => {
    const mockUser = {
      id: 1,
      name: 'test user',
      email: 'test@test.com',
      password: 'test password',
      role: {
        name: RoleEnum.REGULAR,
      },
    };

    it('Should return a user', async () => {
      const mockAuthService = {
        signUp: jest.fn().mockResolvedValue(mockUser),
      };
      const controller = await mockDependencies({ mockAuthService });

      const result = await controller.signUp(
        'test user',
        'test@test.com',
        'test password',
        RoleEnum.REGULAR,
      );

      expect(result).toEqual(mockUser);
    });

    it("Should call the service's signUp method with the correct params", async () => {
      const mockAuthService = {
        signUp: jest.fn().mockResolvedValue(mockUser),
      };
      const controller = await mockDependencies({ mockAuthService });

      await controller.signUp(
        'test user',
        'test@test.com',
        'test password',
        RoleEnum.REGULAR,
      );

      expect(mockAuthService.signUp).toHaveBeenCalledWith({
        name: 'test user',
        email: 'test@test.com',
        password: 'test password',
        role: RoleEnum.REGULAR,
      });
    });

    describe("When the service's signUp method fails", () => {
      it('Should throw an InternalServerErrorException', async () => {
        const mockAuthService = {
          signUp: jest.fn().mockRejectedValue(new Error('test error')),
        };
        const controller = await mockDependencies({ mockAuthService });

        try {
          await controller.signUp(
            'test user',
            'test@test.com',
            'test password',
            RoleEnum.REGULAR,
          );
        } catch (error) {
          expect(error.message).toEqual('Error signing up');
          expect(error.status).toEqual(500);
          expect(error).toBeInstanceOf(InternalServerErrorException);
        }
      });
    });
  });
});
