import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'John Smith' })
  full_name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: '+962791234567' })
  phone_number: string;

  @ApiPropertyOptional({
    description: 'Only returned in internal mode',
    example: '1234567890',
  })
  national_id?: string | null;

  @ApiPropertyOptional({
    description: 'Only returned in internal mode',
    example: 'VIP customer, handle with care',
  })
  internal_notes?: string | null;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z' })
  updated_at: string;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class PaginatedCustomerResponseDto {
  @ApiProperty({ type: [CustomerResponseDto] })
  data: CustomerResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class DeleteResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;
}

export class BulkDeleteResponseDto {
  @ApiProperty({
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  ids: string[];

  @ApiProperty({ example: 3 })
  deletedCount: number;
}
