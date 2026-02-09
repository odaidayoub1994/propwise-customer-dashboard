import { cn } from './utils';

describe('cn', () => {
  it('merges Tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toContain('px-4');
    expect(result).toContain('py-1');
    expect(result).not.toContain('px-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'extra')).toBe('base extra');
  });

  it('handles array inputs', () => {
    expect(cn(['flex', 'items-center'])).toBe('flex items-center');
  });
});
