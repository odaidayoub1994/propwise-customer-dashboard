import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name is required' })
  @ApiProperty({ description: 'Customer full name', example: 'John Smith' })
  full_name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @ApiProperty({
    description: 'Customer email address',
    example: 'john@example.com',
  })
  email: string;

  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @ApiProperty({
    description: 'Customer phone number',
    example: '+962791234567',
  })
  phone_number: string;

  @IsString({ message: 'National ID must be a string' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Sensitive — only accepted in internal mode',
  })
  national_id?: string;

  @IsString({ message: 'Internal notes must be a string' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Sensitive — only accepted in internal mode',
  })
  internal_notes?: string;
}
