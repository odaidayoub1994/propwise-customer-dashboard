import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT, CORS_ORIGIN } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: CORS_ORIGIN });
  await app.listen(PORT);
}
void bootstrap();
