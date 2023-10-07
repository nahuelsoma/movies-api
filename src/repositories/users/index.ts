import { Injectable } from '@nestjs/common';
import { Database } from '../../infrastructure/database';
import { CreateUser, FindAllUsers, FindOneUser, RoleEnum, User } from './types';

@Injectable()
export class UsersRepository {
  constructor(private database: Database) {}

  async create({
    name,
    email,
    password,
    role = RoleEnum.REGULAR,
  }: CreateUser): Promise<User> {
    try {
      return this.database.user.create({
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
      }) as Promise<User>;
    } catch (error) {
      // enhace this error handling
      console.log('error in UsersRepository.create: ', error.message);

      return null;
    }
  }

  async findAll({
    skip = 0,
    take = 10,
    favorites = false,
  }: FindAllUsers): Promise<User[]> {
    try {
      return this.database.user.findMany({
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
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
      }) as Promise<User[]>;
    } catch (error) {
      // enhace this error handling
      console.log('error in UsersRepository.findAll: ', error.message);

      return [];
    }
  }

  async findOne({
    id,
    email,
    favorites = false,
    isLogin = false,
  }: FindOneUser): Promise<User | null> {
    if (!id && !email) {
      return null;
    }

    try {
      return this.database.user.findUnique({
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
      }) as Promise<User>;
    } catch (error) {
      // enhace this error handling
      console.log('error in UsersRepository.findOne: ', error.message);

      return null;
    }
  }
}
