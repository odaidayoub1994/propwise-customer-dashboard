import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { Customer } from './entities/customer.entity';
import { CustomersGateway } from './customers.gateway';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly gateway: CustomersGateway,
  ) {}
}
