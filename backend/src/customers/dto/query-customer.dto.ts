import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryCustomerDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(50, { message: 'Limit cannot exceed 50' })
  @ApiPropertyOptional({ description: 'Items per page', example: 20 })
  limit: number = 20;

  @IsOptional()
  @IsString({ message: 'Search query must be a string' })
  @ApiPropertyOptional({
    description: 'Search by name or email',
    example: 'john',
  })
  q?: string;

  @IsOptional()
  @IsIn(['created_at', 'full_name'], {
    message: 'Sort field must be created_at or full_name',
  })
  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['created_at', 'full_name'],
  })
  sort_by: string = 'created_at';

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsIn(['ASC', 'DESC'], { message: 'Sort order must be ASC or DESC' })
  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['ASC', 'DESC'],
  })
  sort_order: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsDateString({}, { message: 'date_from must be a valid ISO date string' })
  @ApiPropertyOptional({
    description: 'Filter from date',
    example: '2026-01-01',
  })
  date_from?: string;

  @IsOptional()
  @IsDateString({}, { message: 'date_to must be a valid ISO date string' })
  @ApiPropertyOptional({
    description: 'Filter to date',
    example: '2026-12-31',
  })
  date_to?: string;
}
