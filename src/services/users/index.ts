import { Injectable } from '@nestjs/common';
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
      return this.usersRepository.create({
        name,
        email,
        password,
        role,
      });
    } catch (error) {
      // enhace this error handling
      console.log('error in UsersService.create: ', error.message);

      return null;
    }
  }

  async getOne({
    id,
    email,
    isLogin,
    favorites,
  }: FindOneUser): Promise<User | null> {
    try {
      return this.usersRepository.findOne({
        id,
        email,
        isLogin,
        favorites,
      });
    } catch (error) {
      // enhace this error handling
      console.log('error in UsersService.getOne: ', error.message);

      return null;
    }
  }
}
