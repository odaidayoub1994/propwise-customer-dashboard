import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';

describe('CreateCustomerDto', () => {
  function toDto(partial: Partial<CreateCustomerDto>) {
    return plainToInstance(CreateCustomerDto, partial);
  }

  it('should pass with all required fields', async () => {
    const dto = toDto({
      full_name: 'John Smith',
      email: 'john@example.com',
      phone_number: '+962791234567',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass with optional fields included', async () => {
    const dto = toDto({
      full_name: 'John Smith',
      email: 'john@example.com',
      phone_number: '+962791234567',
      national_id: '1234567890',
      internal_notes: 'VIP client',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when full_name is missing', async () => {
    const dto = toDto({
      email: 'john@example.com',
      phone_number: '+962791234567',
    });

    const errors = await validate(dto);
    const fullNameError = errors.find((e) => e.property === 'full_name');
    expect(fullNameError).toBeDefined();
  });

  it('should fail when full_name is empty string', async () => {
    const dto = toDto({
      full_name: '',
      email: 'john@example.com',
      phone_number: '+962791234567',
    });

    const errors = await validate(dto);
    const fullNameError = errors.find((e) => e.property === 'full_name');
    expect(fullNameError).toBeDefined();
  });

  it('should fail when email is invalid', async () => {
    const dto = toDto({
      full_name: 'John Smith',
      email: 'not-an-email',
      phone_number: '+962791234567',
    });

    const errors = await validate(dto);
    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError).toBeDefined();
  });

  it('should fail when email is missing', async () => {
    const dto = toDto({
      full_name: 'John Smith',
      phone_number: '+962791234567',
    });

    const errors = await validate(dto);
    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError).toBeDefined();
  });

  it('should fail when phone_number is missing', async () => {
    const dto = toDto({
      full_name: 'John Smith',
      email: 'john@example.com',
    });

    const errors = await validate(dto);
    const phoneError = errors.find((e) => e.property === 'phone_number');
    expect(phoneError).toBeDefined();
  });

  it('should fail when phone_number is empty string', async () => {
    const dto = toDto({
      full_name: 'John Smith',
      email: 'john@example.com',
      phone_number: '',
    });

    const errors = await validate(dto);
    const phoneError = errors.find((e) => e.property === 'phone_number');
    expect(phoneError).toBeDefined();
  });
});
