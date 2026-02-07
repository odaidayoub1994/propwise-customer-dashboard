import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Param,
  Body,
  Headers,
  Inject,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CustomersService } from './customers.service';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { SensitiveFieldsInterceptor } from './interceptors/sensitive-fields.interceptor';

@Controller('customers')
@ApiTags('customers')
@ApiHeader({
  name: 'x-internal',
  required: false,
  description: 'Set to "true" for admin mode — reveals sensitive fields',
})
@UseInterceptors(SensitiveFieldsInterceptor)
export class CustomersController {
  constructor(
    private readonly service: CustomersService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List customers with pagination, search, and filtering',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of customers' })
  findAll(
    @Query() query: QueryCustomerDto,
    @Headers('x-internal') internal?: string,
  ) {
    this.logger.log(
      `[CustomersController] GET /customers — query: ${JSON.stringify(query)}, internal: ${internal}`,
    );
    return this.service.findAll(query, internal === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer found' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-internal') internal?: string,
  ) {
    this.logger.log(
      `[CustomersController] GET /customers/${id}, internal: ${internal}`,
    );
    return this.service.findOne(id, internal === 'true');
  }

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(
    @Body() dto: CreateCustomerDto,
    @Headers('x-internal') internal?: string,
  ) {
    this.logger.log(
      `[CustomersController] POST /customers — internal: ${internal}`,
    );
    if (internal !== 'true') {
      delete dto.national_id;
      delete dto.internal_notes;
    }
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing customer' })
  @ApiResponse({ status: 200, description: 'Customer updated' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
    @Headers('x-internal') internal?: string,
  ) {
    this.logger.log(
      `[CustomersController] PUT /customers/${id} — internal: ${internal}`,
    );
    if (internal !== 'true') {
      delete dto.national_id;
      delete dto.internal_notes;
    }
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a single customer' })
  @ApiResponse({ status: 200, description: 'Customer deleted' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`[CustomersController] DELETE /customers/${id}`);
    return this.service.remove(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Bulk delete customers by IDs' })
  @ApiResponse({ status: 200, description: 'Customers deleted' })
  bulkDelete(@Body() dto: BulkDeleteDto) {
    this.logger.log(
      `[CustomersController] DELETE /customers (bulk) — ${dto.ids.length} ids`,
    );
    return this.service.bulkDelete(dto.ids);
  }
}
