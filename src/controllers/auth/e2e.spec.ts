import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/services/auth';
import { RoleEnum, User } from 'src/repositories/users/types';
import { AuthModule } from 'src/modules/auth';

describe('Auth', () => {
  let app: INestApplication;

  const mockApp = async (authService: any): Promise<INestApplication> => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleRef.createNestApplication();
    return app;
  };

  afterEach(async () => {
    await app.close();
  });

  describe('When user sends a POST request to /auth/login', () => {
    describe('And the credentials are valid', () => {
      it('Should respond with the token', async () => {
        const authService = {
          login: () => {
            return {
              auth_token: 'test auth token',
            };
          },
        };
        const credentials = {
          username: 'john',
          password: 'changeme',
        };
        const app = await mockApp(authService);

        await app.init();

        return request(app.getHttpServer())
          .post('/auth/login')
          .send(credentials)
          .expect(200)
          .expect(authService.login());
      });
    });

    describe('And the credentials are invalid', () => {
      it('Should respond with a 401', async () => {
        const authService = {
          login: () => {
            throw new UnauthorizedException('Invalid email or password');
          },
        };
        const credentials = {
          username: 'john',
          password: 'changeme',
        };
        const app = await mockApp(authService);

        await app.init();

        return request(app.getHttpServer())
          .post('/auth/login')
          .send(credentials)
          .expect(401)
          .expect({
            statusCode: 401,
            message: 'Invalid email or password',
            error: 'Unauthorized',
          });
      });
    });
  });

  describe('When user sends a POST request to /auth/sign-up', () => {
    describe('And the credentials are valid', () => {
      it('Should respond with the token', async () => {
        const mockUser: User = {
          id: 1,
          name: 'Test',
          email: 'test@test.com',
          role: {
            name: RoleEnum.REGULAR,
          },
        };
        const authService = {
          signUp: () => {
            return mockUser;
          },
        };
        const credentials = {
          name: 'Test',
          email: 'test@test.com',
          password: 'test password',
        };
        const app = await mockApp(authService);

        await app.init();

        return request(app.getHttpServer())
          .post('/auth/sign-up')
          .send(credentials)
          .expect(201)
          .expect(authService.signUp());
      });
    });
  });
});
