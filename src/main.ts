import { NestFactory } from '@nestjs/core';
import { CoreModule } from './modules/core';
import {
  PrismaKnownExceptionsFilter,
  PrismaValidationExceptionsFilter,
} from './filters/prisma-exceptions';
import { AxiosExceptionsFilter } from './filters/axios-exceptions';

async function bootstrap() {
  const app = await NestFactory.create(CoreModule);
  app.useGlobalFilters(
    new PrismaKnownExceptionsFilter(),
    new PrismaValidationExceptionsFilter(),
    new AxiosExceptionsFilter(),
  );
  await app.listen(3000);
}
bootstrap();
