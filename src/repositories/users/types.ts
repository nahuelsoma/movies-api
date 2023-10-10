export enum RoleEnum {
  REGULAR = 'regular',
  ADMIN = 'admin',
}

export interface Role {
  name: RoleEnum;
}

interface FavoriteMovie {
  title: string;
  opening_crawl: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  password?: string;
  favorites?: FavoriteMovie[];
}

export interface CreateUser {
  name: string;
  email: string;
  password: string;
  role: RoleEnum;
}

export interface FindAllUsers {
  skip?: number;
  take?: number;
  favorites?: boolean;
}

export interface FindOneUser {
  id?: number;
  email?: string;
  isLogin?: boolean;
  favorites?: boolean;
}
