import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
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
  constructor(private readonly usersRepository: UsersRepository) {}

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
      // enhance error logging
      console.log('error in UsersService.getOne: ', error.message);

      if (
        error instanceof PrismaClientKnownRequestError ||
        error instanceof PrismaClientValidationError ||
        error instanceof HttpException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error getting user. Please try again later.',
      );
    }
  }
}
