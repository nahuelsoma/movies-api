import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { RoleEnum } from 'src/repositories/users/types';

export class LoginSchema {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class SignUpSchema {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(6)
  @MaxLength(30)
  @IsNotEmpty()
  password: string;

  @MinLength(2)
  @MaxLength(30)
  @IsNotEmpty()
  name: string;

  @IsEnum(RoleEnum)
  role?: RoleEnum = RoleEnum.REGULAR;
}
