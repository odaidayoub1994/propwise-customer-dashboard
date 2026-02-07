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
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { SensitiveFieldsInterceptor } from './interceptors/sensitive-fields.interceptor';
import { isInternalRequest } from './utils/is-internal-request';

@Controller('customers')
@ApiTags('customers')
@ApiHeader({
  name: 'x-internal',
  required: false,
  description: 'Set to "true" for admin mode — reveals sensitive fields',
})
@UseInterceptors(SensitiveFieldsInterceptor)
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  @ApiOperation({
    summary: 'List customers with pagination, search, and filtering',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of customers' })
  findAll(
    @Query() query: QueryCustomerDto,
    @Headers('x-internal') internal?: string,
  ) {
    return this.service.findAll(query, isInternalRequest(internal));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer found' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-internal') internal?: string,
  ) {
    return this.service.findOne(id, isInternalRequest(internal));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(
    @Body() dto: CreateCustomerDto,
    @Headers('x-internal') internal?: string,
  ) {
    return this.service.create(dto, isInternalRequest(internal));
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
    return this.service.update(id, dto, isInternalRequest(internal));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a single customer' })
  @ApiResponse({ status: 200, description: 'Customer deleted' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Bulk delete customers by IDs' })
  @ApiResponse({ status: 200, description: 'Customers deleted' })
  bulkDelete(@Body() dto: BulkDeleteDto) {
    return this.service.bulkDelete(dto.ids);
  }
}
