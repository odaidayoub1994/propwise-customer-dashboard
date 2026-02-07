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
import { SocketService } from '../socket/socket.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { stripSensitive } from './utils/strip-sensitive';
import { CACHE_TTL } from '../config/env.config';
import { CustomerEventPayload } from './types/socket-events';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly socketService: SocketService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  private async cacheSet(key: string, data: unknown): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(data), 'EX', CACHE_TTL);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.warn(`[CustomersService] Redis set error: ${error.message}`);
    }
  }

  private async invalidateCaches(detailIds?: string[]): Promise<void> {
    try {
      await this.redis.incr('customers:list:version');
      if (detailIds?.length) {
        const keys = detailIds.flatMap((id) => [
          `customers:detail:${id}:true`,
          `customers:detail:${id}:false`,
        ]);
        await this.redis.del(...keys);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.warn(
        `[CustomersService] Redis invalidation error: ${error.message}`,
      );
    }
  }

  private buildCustomerPayload(customer: Customer): CustomerEventPayload {
    return {
      id: customer.id,
      full_name: customer.full_name,
      email: customer.email,
      phone_number: customer.phone_number,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    };
  }

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

    // Sanitize before caching — public Redis keys must never hold sensitive data
    const responseData = isInternal
      ? result
      : {
          ...result,
          data: result.data.map((c) =>
            stripSensitive(c as unknown as Record<string, unknown>),
          ),
        };

    if (cacheKey) {
      await this.cacheSet(cacheKey, responseData);
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

    // Sanitize before caching — public Redis keys must never hold sensitive data
    const responseData = isInternal
      ? customer
      : stripSensitive(customer as unknown as Record<string, unknown>);

    await this.cacheSet(cacheKey, responseData);

    return responseData;
  }

  async create(dto: CreateCustomerDto, isInternal: boolean) {
    if (!isInternal) {
      delete dto.national_id;
      delete dto.internal_notes;
    }

    const saved = await this.repo.save(this.repo.create(dto));

    this.logger.log(
      `[CustomersService] Customer created: ${saved.id} (${saved.email})`,
    );

    await this.invalidateCaches();

    this.socketService.emit(
      'customer.created',
      this.buildCustomerPayload(saved),
    );

    return saved;
  }

  async update(id: string, dto: UpdateCustomerDto, isInternal: boolean) {
    if (!isInternal) {
      delete dto.national_id;
      delete dto.internal_notes;
    }

    const customer = await this.repo.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    Object.assign(customer, dto);
    const saved = await this.repo.save(customer);

    this.logger.log(
      `[CustomersService] Customer updated: ${saved.id} (${saved.email})`,
    );

    await this.invalidateCaches([id]);

    this.socketService.emit(
      'customer.updated',
      this.buildCustomerPayload(saved),
    );

    return saved;
  }

  async remove(id: string) {
    const customer = await this.repo.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    await this.repo.remove(customer);

    this.logger.log(`[CustomersService] Customer deleted: ${id}`);

    await this.invalidateCaches([id]);

    this.socketService.emit('customer.deleted', { id });

    return { id };
  }

  async bulkDelete(ids: string[]) {
    await this.repo.delete({ id: In(ids) });

    this.logger.log(`[CustomersService] Bulk deleted ${ids.length} customers`);

    await this.invalidateCaches(ids.length > 0 ? ids : undefined);

    this.socketService.emit('customers.bulk_deleted', { ids });

    return { ids };
  }
}
