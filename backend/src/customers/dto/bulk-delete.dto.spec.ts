import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BulkDeleteDto } from './bulk-delete.dto';

describe('BulkDeleteDto', () => {
  function toDto(partial: Partial<BulkDeleteDto>) {
    return plainToInstance(BulkDeleteDto, partial);
  }

  it('should pass with valid UUID array', async () => {
    const dto = toDto({
      ids: [
        '550e8400-e29b-41d4-a716-446655440000',
        'a3bb189e-8bf9-4a8c-9d77-c84b6e5c90f2',
      ],
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass with empty array', async () => {
    const dto = toDto({ ids: [] });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail with non-UUID strings', async () => {
    const dto = toDto({ ids: ['not-a-uuid', 'also-not-a-uuid'] });

    const errors = await validate(dto);
    const idsError = errors.find((e) => e.property === 'ids');
    expect(idsError).toBeDefined();
  });

  it('should fail when ids is not an array', async () => {
    const dto = toDto({
      ids: 'not-an-array',
    } as unknown as Partial<BulkDeleteDto>);

    const errors = await validate(dto);
    const idsError = errors.find((e) => e.property === 'ids');
    expect(idsError).toBeDefined();
  });

  it('should fail when ids is missing', async () => {
    const dto = toDto({});

    const errors = await validate(dto);
    const idsError = errors.find((e) => e.property === 'ids');
    expect(idsError).toBeDefined();
  });
});
