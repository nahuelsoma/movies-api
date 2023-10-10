import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from 'src/repositories/users/types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);
