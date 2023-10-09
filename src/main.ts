import { NestFactory } from '@nestjs/core';
import { CoreModule } from './modules/core';
import {
  PrismaKnownExceptionsFilter,
  PrismaValidationExceptionsFilter,
} from './filters/prisma-exceptions';
import { AxiosExceptionsFilter } from './filters/axios-exceptions';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(CoreModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),
      ],
    }),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(
    new PrismaKnownExceptionsFilter(app.get(Logger)),
    new PrismaValidationExceptionsFilter(app.get(Logger)),
    new AxiosExceptionsFilter(app.get(Logger)),
  );
  await app.listen(3000);
}
bootstrap();
