import { createMock } from '@golevelup/ts-jest';
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from 'src/services/auth/types';
import { RoleEnum } from 'src/repositories/users/types';
import { RolesGuard } from '.';

describe('RolesGuard', () => {
  let authenticatedGuard: RolesGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    jwtService = new JwtService();
    authenticatedGuard = new RolesGuard(jwtService, reflector);
  });

  describe('canActivate', () => {
    describe('When the route does not have the @Roles decorator', () => {
      it('Should return true', async () => {
        reflector.getAllAndOverride = jest.fn().mockReturnValueOnce(undefined);
        const mockContext = createMock<ExecutionContext>();
        const canActivate = await authenticatedGuard.canActivate(mockContext);
        expect(canActivate).toBe(true);
      });
    });

    describe('When the route has the @Roles decorator', () => {
      describe("And user doesn't provide an auth token", () => {
        it('Should return false and throw an BadRequestException', async () => {
          reflector.getAllAndOverride = jest
            .fn()
            .mockReturnValueOnce([RoleEnum.REGULAR]);
          const mockContext = createMock<ExecutionContext>();
          mockContext.switchToHttp().getRequest.mockReturnValue({
            headers: {},
          });

          try {
            await authenticatedGuard.canActivate(mockContext);
          } catch (error) {
            expect(error).toBeInstanceOf(BadRequestException);
            expect(error.message).toBe('No token provided');
            expect(error.status).toBe(400);
          }
        });
      });

      describe('And user provides an auth token', () => {
        describe('And the token is invalid', () => {
          it('Should return false and throw an UnauthorizedException', async () => {
            reflector.getAllAndOverride = jest
              .fn()
              .mockReturnValueOnce([RoleEnum.REGULAR]);
            const mockContext = createMock<ExecutionContext>();
            mockContext.switchToHttp().getRequest.mockReturnValue({
              headers: {
                authorization: 'Bearer invalid_token',
              },
            });
            jwtService.verifyAsync = jest
              .fn()
              .mockRejectedValueOnce(new Error());

            try {
              await authenticatedGuard.canActivate(mockContext);
            } catch (error) {
              expect(error).toBeInstanceOf(UnauthorizedException);
              expect(error.message).toBe('Invalid token');
              expect(error.status).toBe(401);
            }
          });
        });

        describe('And the token is valid', () => {
          describe('And the user has the required role', () => {
            it('Should return true', async () => {
              reflector.getAllAndOverride = jest
                .fn()
                .mockReturnValue([RoleEnum.REGULAR]);

              const mockContext = createMock<ExecutionContext>();
              mockContext.switchToHttp().getRequest.mockReturnValueOnce({
                headers: {
                  authorization: 'Bearer valid_token',
                },
              });
              const payload: JWTPayload = {
                id: 1,
                email: 'test@test.com',
                role: RoleEnum.REGULAR,
              };
              jwtService.verifyAsync = jest.fn().mockResolvedValueOnce(payload);

              const canActivate = await authenticatedGuard.canActivate(
                mockContext,
              );
              expect(canActivate).toBe(true);
            });
          });

          describe("And the user doesn't have the required role", () => {
            it('Should return false and throw a ForbiddenException', async () => {
              reflector.getAllAndOverride = jest
                .fn()
                .mockReturnValue([RoleEnum.ADMIN]);

              const mockContext = createMock<ExecutionContext>();
              mockContext.switchToHttp().getRequest.mockReturnValueOnce({
                headers: {
                  authorization: 'Bearer valid_token',
                },
              });
              const payload: JWTPayload = {
                id: 1,
                email: 'test@test.com',
                role: RoleEnum.REGULAR,
              };
              jwtService.verifyAsync = jest.fn().mockResolvedValueOnce(payload);

              try {
                await authenticatedGuard.canActivate(mockContext);
              } catch (error) {
                expect(error).toBeInstanceOf(ForbiddenException);
                expect(error.message).toBe("You don't have the required role");
                expect(error.status).toBe(403);
              }
            });
          });
        });
      });
    });
  });
});
