import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  ILike,
  Between,
  In,
  FindOptionsWhere,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import Redis from 'ioredis';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Customer } from './entities/customer.entity';
import { CustomersGateway } from './customers.gateway';
import { REDIS_CLIENT } from '../redis/redis.module';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { stripSensitive } from './utils/strip-sensitive';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly gateway: CustomersGateway,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async findAll(query: QueryCustomerDto, isInternal: boolean) {
    const { page, limit, q, sort_by, sort_order, date_from, date_to } = query;

    let cacheKey: string | null = null;
    try {
      const version = (await this.redis.get('customers:list:version')) ?? '0';
      cacheKey = `customers:list:v=${version}:p=${page}:l=${limit}:q=${q || ''}:sb=${sort_by}:so=${sort_order}:df=${date_from || ''}:dt=${date_to || ''}:i=${isInternal}`;

      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug?.(
          `[CustomersService] Cache hit for key: ${cacheKey}`,
        );
        return JSON.parse(cached) as unknown;
      }
      this.logger.debug?.('[CustomersService] Cache miss, querying database');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.warn(
        `[CustomersService] Redis error in findAll, falling back to DB: ${error.message}`,
      );
    }

    // Build date filter
    let dateFilter: FindOptionsWhere<Customer> = {};
    if (date_from && date_to) {
      const endDate = new Date(date_to);
      endDate.setHours(23, 59, 59, 999);
      dateFilter = { created_at: Between(new Date(date_from), endDate) };
    } else if (date_from) {
      dateFilter = { created_at: MoreThanOrEqual(new Date(date_from)) };
    } else if (date_to) {
      const endDate = new Date(date_to);
      endDate.setHours(23, 59, 59, 999);
      dateFilter = { created_at: LessThanOrEqual(endDate) };
    }

    const where: FindOptionsWhere<Customer>[] = [];
    if (q) {
      where.push({ full_name: ILike(`%${q}%`), ...dateFilter });
      where.push({ email: ILike(`%${q}%`), ...dateFilter });
    } else if (Object.keys(dateFilter).length > 0) {
      where.push(dateFilter);
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

    this.logger.log(`[CustomersService] Found ${total} customers for query`);

    // Sanitize for public cache, then cache and return
    const responseData = isInternal
      ? result
      : { ...result, data: result.data.map((c) => stripSensitive({ ...c })) };

    if (cacheKey) {
      try {
        await this.redis.set(cacheKey, JSON.stringify(responseData), 'EX', 60);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        this.logger.warn(
          `[CustomersService] Redis set error: ${error.message}`,
        );
      }
    }

    return responseData;
  }

  async findOne(id: string, isInternal: boolean) {
    const cacheKey = `customers:detail:${id}:${isInternal}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug?.(`[CustomersService] Cache hit for customer ${id}`);
        return JSON.parse(cached) as unknown;
      }
      this.logger.debug?.(`[CustomersService] Cache miss for customer ${id}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.warn(
        `[CustomersService] Redis error in findOne, falling back to DB: ${error.message}`,
      );
    }

    const customer = await this.repo.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    const responseData = isInternal
      ? customer
      : stripSensitive({ ...customer });

    try {
      await this.redis.set(cacheKey, JSON.stringify(responseData), 'EX', 60);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.warn(`[CustomersService] Redis set error: ${error.message}`);
    }

    return responseData;
  }

  async create(dto: CreateCustomerDto) {
    const saved = await this.repo.save(this.repo.create(dto));

    this.logger.log(
      `[CustomersService] Customer created: ${saved.id} (${saved.email})`,
    );

    try {
      await this.redis.incr('customers:list:version');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.warn(`[CustomersService] Redis incr error: ${error.message}`);
    }

    this.gateway.emit('customer.created', {
      id: saved.id,
      full_name: saved.full_name,
      email: saved.email,
      phone_number: saved.phone_number,
      created_at: saved.created_at,
      updated_at: saved.updated_at,
    });

    return saved;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.repo.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    Object.assign(customer, dto);
    const saved = await this.repo.save(customer);

    this.logger.log(
      `[CustomersService] Customer updated: ${saved.id} (${saved.email})`,
    );

    try {
      await this.redis.incr('customers:list:version');
      await this.redis.del(
        `customers:detail:${id}:true`,
        `customers:detail:${id}:false`,
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.warn(
        `[CustomersService] Redis invalidation error: ${error.message}`,
      );
    }

    this.gateway.emit('customer.updated', {
      id: saved.id,
      full_name: saved.full_name,
      email: saved.email,
      phone_number: saved.phone_number,
      created_at: saved.created_at,
      updated_at: saved.updated_at,
    });

    return saved;
  }

  async remove(id: string) {
    const customer = await this.repo.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    await this.repo.remove(customer);

    this.logger.log(`[CustomersService] Customer deleted: ${id}`);

    try {
      await this.redis.incr('customers:list:version');
      await this.redis.del(
        `customers:detail:${id}:true`,
        `customers:detail:${id}:false`,
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.warn(
        `[CustomersService] Redis invalidation error: ${error.message}`,
      );
    }

    this.gateway.emit('customer.deleted', { id });

    return { id };
  }

  async bulkDelete(ids: string[]) {
    await this.repo.delete({ id: In(ids) });

    this.logger.log(`[CustomersService] Bulk deleted ${ids.length} customers`);

    try {
      await this.redis.incr('customers:list:version');
      if (ids.length > 0) {
        const detailKeys = ids.flatMap((id) => [
          `customers:detail:${id}:true`,
          `customers:detail:${id}:false`,
        ]);
        await this.redis.del(...detailKeys);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.warn(
        `[CustomersService] Redis invalidation error: ${error.message}`,
      );
    }

    this.gateway.emit('customers.bulk_deleted', { ids });

    return { ids };
  }
}
