import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { CustomersGateway } from './customers.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [CustomersGateway],
})
export class CustomersModule {}
