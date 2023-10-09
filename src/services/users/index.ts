import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { UsersRepository } from 'src/repositories/users';
import {
  CreateUser,
  FindOneUser,
  RoleEnum,
  User,
} from 'src/repositories/users/types';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: Logger,
  ) {}

  async create({
    name,
    email,
    password,
    role = RoleEnum.REGULAR,
  }: CreateUser): Promise<User> {
    return await this.usersRepository.create({
      name,
      email,
      password,
      role,
    });
  }

  async getOne({
    id,
    email,
    isLogin = false,
    favorites = false,
  }: FindOneUser): Promise<User | null> {
    try {
      if (!id && !email) {
        throw new BadRequestException('id or email must be provided');
      }

      return await this.usersRepository.findOne({
        id,
        email,
        isLogin,
        favorites,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError ||
        error instanceof HttpException
      ) {
        throw error;
      }

      const message = 'Error getting user. Please try again later.';

      this.logger.error(message, error.stack, 'InternalServerErrorException');

      throw new InternalServerErrorException(message, error.message);
    }
  }
}
