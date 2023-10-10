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
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

  const config = new DocumentBuilder()
    .setTitle('Movies API')
    .setDescription('The API for your favorite movies')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
