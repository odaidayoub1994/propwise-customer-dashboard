import { Injectable, Inject } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import Redis from 'ioredis';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { REDIS_CLIENT } from '../redis/redis.module';
import { CACHE_TTL } from '../config/env.config';

@Injectable()
export class CacheService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(key);
      if (!raw) return null;
      this.logger.debug?.(`[CacheService] Cache hit for key: ${key}`);
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logError('get', err);
      return null;
    }
  }

  async set(key: string, data: unknown): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(data), 'EX', CACHE_TTL);
    } catch (err) {
      this.logError('set', err);
    }
  }

  async getVersion(key: string): Promise<string> {
    try {
      return (await this.redis.get(key)) ?? '0';
    } catch (err) {
      this.logError('getVersion', err);
      return '0';
    }
  }

  async increment(key: string): Promise<void> {
    try {
      await this.redis.incr(key);
    } catch (err) {
      this.logError('increment', err);
    }
  }

  async deleteKeys(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      await this.redis.del(...keys);
    } catch (err) {
      this.logError('deleteKeys', err);
    }
  }

  private logError(operation: string, err: unknown): void {
    const message = err instanceof Error ? err.message : String(err);
    this.logger.warn(`[CacheService] Redis ${operation} error: ${message}`);
  }
}
