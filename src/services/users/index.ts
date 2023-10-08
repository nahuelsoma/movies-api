import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
    try {
      return await this.usersRepository.create({
        name,
        email,
        password,
        role,
      });
    } catch (error) {
      // enhace this error handling
      console.log('error in UsersService.create: ', error.message);

      throw new InternalServerErrorException('Error creating user');
    }
  }

  async getOne({
    id,
    email,
    isLogin,
    favorites,
  }: FindOneUser): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({
        id,
        email,
        isLogin,
        favorites,
      });
    } catch (error) {
      // enhace this error handling
      console.log('error in UsersService.getOne: ', error.message);

      throw new InternalServerErrorException('Error getting user');
    }
  }
}
