import { Logger, Module } from '@nestjs/common';
import { AuthModule } from '../auth';
import { MoviesModule } from '../movies';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import {
  PrismaKnownExceptionsFilter,
  PrismaValidationExceptionsFilter,
} from 'src/filters/prisma-exceptions';
import { AxiosExceptionsFilter } from 'src/filters/axios-exceptions';
import { RolesGuard } from 'src/guards/roles';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaKnownExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaValidationExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AxiosExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    Logger,
  ],
  imports: [MoviesModule, AuthModule],
})
export class CoreModule {}
