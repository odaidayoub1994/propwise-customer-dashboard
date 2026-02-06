import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { PORT, CORS_ORIGIN } from './config/env.config';
import logger from './config/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: CORS_ORIGIN });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Propwise Customer API')
    .setDescription('Customer Activity Dashboard API')
    .setVersion('1.0')
    .addGlobalParameters({
      name: 'x-internal',
      in: 'header',
      required: false,
      description: 'Set to "true" for admin mode',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(PORT);

  logger.info(`[Bootstrap] Application listening on port ${PORT}`);
  logger.info('[Bootstrap] Swagger docs available at /api/docs');
}
void bootstrap();
