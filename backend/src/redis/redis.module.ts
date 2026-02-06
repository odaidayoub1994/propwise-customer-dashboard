import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_HOST, REDIS_PORT } from '../config/env.config';
import logger from '../config/logger';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const redis = new Redis({
          host: REDIS_HOST,
          port: REDIS_PORT,
          maxRetriesPerRequest: null,
        });

        redis.on('connect', () => {
          logger.info(
            `[RedisModule] Connected to Redis on ${REDIS_HOST}:${REDIS_PORT}`,
          );
        });

        redis.on('error', (err: Error) => {
          logger.error(`[RedisModule] Redis error: ${err.message}`);
        });

        return redis;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
