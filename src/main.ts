import { NestFactory } from '@nestjs/core';
import { CoreModule } from './modules/core';

async function bootstrap() {
  const app = await NestFactory.create(CoreModule);
  await app.listen(3000);
}
bootstrap();
