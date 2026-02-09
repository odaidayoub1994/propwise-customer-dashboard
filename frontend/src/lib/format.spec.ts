import { formatDate } from './format';

describe('formatDate', () => {
  it('formats ISO date string to en-US locale', () => {
    const result = formatDate('2024-06-15T10:30:00.000Z');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('handles different months', () => {
    const result = formatDate('2024-01-01T00:00:00.000Z');
    expect(result).toContain('2024');
  });

  it('handles midnight UTC', () => {
    const result = formatDate('2024-12-31T00:00:00.000Z');
    expect(result).toContain('2024');
  });
});
