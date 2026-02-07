import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QueryCustomerDto } from './query-customer.dto';

describe('QueryCustomerDto', () => {
  function toDto(partial: Partial<QueryCustomerDto>) {
    return plainToInstance(QueryCustomerDto, partial);
  }

  it('should use defaults when no fields provided', async () => {
    const dto = toDto({});

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
    expect(dto.sort_by).toBe('created_at');
    expect(dto.sort_order).toBe('DESC');
  });

  it('should pass with all valid fields', async () => {
    const dto = toDto({
      page: 2,
      limit: 10,
      q: 'john',
      sort_by: 'full_name',
      sort_order: 'ASC',
      date_from: '2026-01-01',
      date_to: '2026-12-31',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when limit exceeds 50', async () => {
    const dto = toDto({ limit: 51 });

    const errors = await validate(dto);
    const limitError = errors.find((e) => e.property === 'limit');
    expect(limitError).toBeDefined();
  });

  it('should fail when page is less than 1', async () => {
    const dto = toDto({ page: 0 });

    const errors = await validate(dto);
    const pageError = errors.find((e) => e.property === 'page');
    expect(pageError).toBeDefined();
  });

  it('should fail with invalid sort_by value', async () => {
    const dto = toDto({
      sort_by: 'email',
    } as unknown as Partial<QueryCustomerDto>);

    const errors = await validate(dto);
    const sortByError = errors.find((e) => e.property === 'sort_by');
    expect(sortByError).toBeDefined();
  });

  it('should fail with invalid sort_order value', async () => {
    const dto = toDto({
      sort_order: 'INVALID',
    } as unknown as Partial<QueryCustomerDto>);

    const errors = await validate(dto);
    const sortOrderError = errors.find((e) => e.property === 'sort_order');
    expect(sortOrderError).toBeDefined();
  });

  it('should transform lowercase sort_order to uppercase', async () => {
    const dto = toDto({
      sort_order: 'asc',
    } as unknown as Partial<QueryCustomerDto>);

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.sort_order).toBe('ASC');
  });

  it('should transform mixed-case sort_order to uppercase', async () => {
    const dto = toDto({
      sort_order: 'Desc',
    } as unknown as Partial<QueryCustomerDto>);

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.sort_order).toBe('DESC');
  });

  it('should pass with valid date_from string', async () => {
    const dto = toDto({ date_from: '2026-06-15' });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail with invalid date string', async () => {
    const dto = toDto({ date_from: 'not-a-date' });

    const errors = await validate(dto);
    const dateError = errors.find((e) => e.property === 'date_from');
    expect(dateError).toBeDefined();
  });
});
