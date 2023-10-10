import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Database } from '../../infrastructure/database';
import { CreateUser, FindOneUser, User } from './types';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly database: Database,
    private readonly logger: Logger,
  ) {}

  async create({ name, email, password, role }: CreateUser): Promise<User> {
    try {
      const newUser = await this.database.user.create({
        data: {
          name,
          email,
          password,
          role: {
            connectOrCreate: {
              where: {
                name: role,
              },
              create: {
                name: role,
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

      return newUser as User;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError
      ) {
        throw error;
      }

      const message = 'Error creating user';

      this.logger.error(message, error.stack, 'InternalServerErrorException');

      throw new InternalServerErrorException(message, error.message);
    }
  }

  async findOne({
    id,
    email,
    favorites,
    isLogin,
  }: FindOneUser): Promise<User | null> {
    try {
      const user = await this.database.user.findUnique({
        where: {
          id: id,
          email: email,
        },
        select: {
          id: true,
          name: true,
          email: true,
          password: isLogin && true,
          role: {
            select: {
              name: true,
            },
          },
          favorites: favorites && {
            select: {
              title: true,
              opening_crawl: true,
            },
          },
        },
      });

      return user as User;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError
      ) {
        throw error;
      }

      const message = 'Error finding user';

      this.logger.error(message, error.stack, 'InternalServerErrorException');

      throw new InternalServerErrorException(message, error.message);
    }
  }
}
