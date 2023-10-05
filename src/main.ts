import { NestFactory } from '@nestjs/core';
import { MoviesModule } from './modules/movies';

async function bootstrap() {
  const app = await NestFactory.create(MoviesModule);
  await app.listen(3000);
}
bootstrap();
