import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { RoleEnum } from 'src/repositories/users/types';
import { ApiProperty } from '@nestjs/swagger';

export class LoginSchema {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export class SignUpSchema {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @MinLength(6)
  @MaxLength(30)
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @MinLength(2)
  @MaxLength(30)
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEnum(RoleEnum)
  role?: RoleEnum = RoleEnum.REGULAR;
}
