import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class BulkDeleteDto {
  @IsArray({ message: 'ids must be an array' })
  @IsUUID('4', { each: true, message: 'Each id must be a valid UUID' })
  @ApiProperty({
    description: 'Array of customer UUIDs to delete',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  ids: string[];
}
