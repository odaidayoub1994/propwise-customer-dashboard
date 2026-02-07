import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { LoggerService, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { PORT, CORS_ORIGIN } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  app.enableCors({ origin: CORS_ORIGIN });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter(logger));

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

  logger.log(`[Bootstrap] Application listening on port ${PORT}`);
  logger.log('[Bootstrap] Swagger docs available at /api/docs');
}
void bootstrap();
