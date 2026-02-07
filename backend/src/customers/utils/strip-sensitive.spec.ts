import { stripSensitive } from './strip-sensitive';

describe('stripSensitive', () => {
  it('should strip national_id and internal_notes from flat object', () => {
    const obj = {
      id: '1',
      full_name: 'John',
      email: 'john@test.com',
      national_id: '123',
      internal_notes: 'VIP',
    };

    const result = stripSensitive(obj);

    expect(result).toEqual({
      id: '1',
      full_name: 'John',
      email: 'john@test.com',
    });
  });

  it('should preserve non-sensitive fields', () => {
    const obj = { id: '1', full_name: 'John', phone_number: '+123' };

    const result = stripSensitive(obj);

    expect(result).toEqual({
      id: '1',
      full_name: 'John',
      phone_number: '+123',
    });
  });

  it('should strip sensitive fields from nested objects', () => {
    const obj = {
      customer: {
        id: '1',
        national_id: '123',
        internal_notes: 'secret',
      },
    };

    const result = stripSensitive(obj);

    expect(result).toEqual({
      customer: { id: '1' },
    });
  });

  it('should strip sensitive fields from array items', () => {
    const obj = {
      data: [
        { id: '1', national_id: '123', internal_notes: 'A' },
        { id: '2', national_id: '456', internal_notes: 'B' },
      ],
    };

    const result = stripSensitive(obj);

    expect(result).toEqual({
      data: [{ id: '1' }, { id: '2' }],
    });
  });

  it('should preserve Date values without recursing into them', () => {
    const date = new Date('2026-01-01');
    const obj = { created_at: date, national_id: '123' };

    const result = stripSensitive(obj);

    expect(result).toEqual({ created_at: date });
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should return empty object for empty input', () => {
    expect(stripSensitive({})).toEqual({});
  });

  it('should not mutate the original object', () => {
    const obj = { id: '1', national_id: '123', internal_notes: 'VIP' };
    const original = { ...obj };

    stripSensitive(obj);

    expect(obj).toEqual(original);
  });

  it('should handle arrays with non-object items', () => {
    const obj = { tags: ['admin', 'vip'], national_id: '123' };

    const result = stripSensitive(obj);

    expect(result).toEqual({ tags: ['admin', 'vip'] });
  });
});
