import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ROLES_KEY } from 'src/decorators';
import { RoleEnum } from 'src/repositories/users/types';
import { JWTPayload } from 'src/services/auth/types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new BadRequestException('No token provided');
    }

    let user: JWTPayload;

    try {
      const payload: JWTPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.AUTH_SECRET,
      });

      user = payload;

      request['user'] = user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException("You don't have the required role");
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
