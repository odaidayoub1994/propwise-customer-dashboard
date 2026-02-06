import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, FindOptionsWhere } from 'typeorm';
import Redis from 'ioredis';
import { Customer } from './entities/customer.entity';
import { CustomersGateway } from './customers.gateway';
import { REDIS_CLIENT } from '../redis/redis.module';
import { QueryCustomerDto } from './dto/query-customer.dto';
import logger from '../config/logger';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly gateway: CustomersGateway,
  ) {}

  async findAll(query: QueryCustomerDto, isInternal: boolean) {
    const { page, limit, q, sort_by, sort_order, date_from, date_to } = query;

    // Build cache key with version
    let cacheKey: string | null = null;
    try {
      const version = (await this.redis.get('customers:list:version')) ?? '0';
      cacheKey = `customers:list:v=${version}:${JSON.stringify({ ...query, isInternal })}`;

      const cached = await this.redis.get(cacheKey);
      if (cached) {
        logger.debug(`[CustomersService] Cache hit for key: ${cacheKey}`);
        return JSON.parse(cached) as unknown;
      }
      logger.debug('[CustomersService] Cache miss, querying database');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.warn(
        `[CustomersService] Redis error in findAll, falling back to DB: ${error.message}`,
      );
    }

    // Build where clause
    const where: FindOptionsWhere<Customer>[] = [];

    const dateRange =
      date_from && date_to
        ? { created_at: Between(new Date(date_from), new Date(date_to)) }
        : {};

    if (q) {
      where.push({ full_name: ILike(`%${q}%`), ...dateRange });
      where.push({ email: ILike(`%${q}%`), ...dateRange });
    } else if (date_from && date_to) {
      where.push(dateRange);
    }

    const [data, total] = await this.repo.findAndCount({
      where: where.length > 0 ? where : undefined,
      order: { [sort_by]: sort_order },
      skip: (page - 1) * limit,
      take: limit,
    });

    const result = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    logger.info(`[CustomersService] Found ${total} customers for query`);

    // Cache result
    if (cacheKey) {
      try {
        await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.warn(`[CustomersService] Redis set error: ${error.message}`);
      }
    }

    return result;
  }

  async findOne(id: string, isInternal: boolean) {
    const cacheKey = `customers:detail:${id}:${isInternal}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        logger.debug(`[CustomersService] Cache hit for customer ${id}`);
        return JSON.parse(cached) as unknown;
      }
      logger.debug(`[CustomersService] Cache miss for customer ${id}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.warn(
        `[CustomersService] Redis error in findOne, falling back to DB: ${error.message}`,
      );
    }

    const customer = await this.repo.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    try {
      await this.redis.set(cacheKey, JSON.stringify(customer), 'EX', 60);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.warn(`[CustomersService] Redis set error: ${error.message}`);
    }

    return customer;
  }
}
