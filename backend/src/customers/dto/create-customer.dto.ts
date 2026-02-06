import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Customer full name', example: 'John Smith' })
  full_name: string;

  @IsEmail()
  @ApiProperty({
    description: 'Customer email address',
    example: 'john@example.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Customer phone number',
    example: '+962791234567',
  })
  phone_number: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Sensitive — only accepted in internal mode',
  })
  national_id?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Sensitive — only accepted in internal mode',
  })
  internal_notes?: string;
}
