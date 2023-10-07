import { RoleEnum } from 'src/repositories/users/types';

export interface SignIn {
  email: string;
  password: string;
}

export interface SignInResponse {
  access_token: string;
}

export interface JWTPayload {
  id: number;
  email: string;
  role: RoleEnum;
}
