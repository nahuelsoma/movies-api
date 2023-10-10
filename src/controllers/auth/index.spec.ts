import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { AuthController } from '.';
import { Test } from '@nestjs/testing';
import { AuthService } from 'src/services/auth';
import { RoleEnum, User } from 'src/repositories/users/types';

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

      const result = await controller.login({
        email: 'test@test.com',
        password: 'test password',
      });

      expect(result).toEqual(mockAuthToken);
    });

    it("Should call the service's login method with the correct params", async () => {
      const mockAuthService = {
        login: jest.fn().mockResolvedValue(mockAuthToken),
      };
      const controller = await mockDependencies({ mockAuthService });

      await controller.login({
        email: 'test@test.com',
        password: 'test password',
      });

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'test password',
      });
    });
  });

  describe('signUp method', () => {
    const mockUser: User = {
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

      const result = await controller.signUp({
        name: 'test user',
        email: 'test@test.com',
        password: 'test password',
        role: RoleEnum.REGULAR,
      });

      expect(result).toEqual(mockUser);
    });

    it("Should call the service's signUp method with the correct params", async () => {
      const mockAuthService = {
        signUp: jest.fn().mockResolvedValue(mockUser),
      };
      const controller = await mockDependencies({ mockAuthService });

      await controller.signUp({
        name: 'test user',
        email: 'test@test.com',
        password: 'test password',
        role: RoleEnum.REGULAR,
      });

      expect(mockAuthService.signUp).toHaveBeenCalledWith({
        name: 'test user',
        email: 'test@test.com',
        password: 'test password',
        role: RoleEnum.REGULAR,
      });
    });
  });
});
