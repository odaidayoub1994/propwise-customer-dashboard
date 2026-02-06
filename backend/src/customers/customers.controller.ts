import {
  Controller,
  Get,
  Query,
  Param,
  Headers,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { SensitiveFieldsInterceptor } from './interceptors/sensitive-fields.interceptor';
import logger from '../config/logger';

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
    logger.info(
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
    logger.info(
      `[CustomersController] GET /customers/${id}, internal: ${internal}`,
    );
    return this.service.findOne(id, internal === 'true');
  }
}
