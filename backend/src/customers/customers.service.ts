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
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Customer } from './entities/customer.entity';
import { SocketService } from '../socket/socket.service';
import { CacheService } from '../cache/cache.service';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { stripSensitive } from './utils/strip-sensitive';
import { CustomerEventPayload } from './types/socket-events';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
    private readonly cache: CacheService,
    private readonly socketService: SocketService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  private async invalidateCaches(detailIds?: string[]): Promise<void> {
    await this.cache.increment('customers:list:version');
    if (detailIds?.length) {
      const keys = detailIds.flatMap((id) => [
        `customers:detail:${id}:true`,
        `customers:detail:${id}:false`,
      ]);
      await this.cache.deleteKeys(...keys);
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

  private buildWhereClause(
    query: QueryCustomerDto,
  ): FindOptionsWhere<Customer>[] | undefined {
    const { q, date_from, date_to } = query;

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

    return where.length > 0 ? where : undefined;
  }

  async findAll(query: QueryCustomerDto, isInternal: boolean) {
    const { page, limit, q, sort_by, sort_order, date_from, date_to } = query;

    const version = await this.cache.getVersion('customers:list:version');
    const cacheKey = `customers:list:v=${version}:p=${page}:l=${limit}:q=${q || ''}:sb=${sort_by}:so=${sort_order}:df=${date_from || ''}:dt=${date_to || ''}:i=${isInternal}`;

    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    this.logger.debug?.('[CustomersService] Cache miss, querying database');

    const [data, total] = await this.repo.findAndCount({
      where: this.buildWhereClause(query),
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

    const responseData = isInternal
      ? result
      : {
          ...result,
          data: result.data.map((c) =>
            stripSensitive(c as unknown as Record<string, unknown>),
          ),
        };

    await this.cache.set(cacheKey, responseData);

    return responseData;
  }

  async findOne(id: string, isInternal: boolean) {
    const cacheKey = `customers:detail:${id}:${isInternal}`;

    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    this.logger.debug?.(`[CustomersService] Cache miss for customer ${id}`);

    const customer = await this.repo.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    const responseData = isInternal
      ? customer
      : stripSensitive(customer as unknown as Record<string, unknown>);

    await this.cache.set(cacheKey, responseData);

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
