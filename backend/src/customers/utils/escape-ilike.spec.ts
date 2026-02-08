import { escapeILike } from './escape-ilike';

describe('escapeILike', () => {
  it('should escape % character', () => {
    expect(escapeILike('100%')).toBe('100\\%');
  });

  it('should escape _ character', () => {
    expect(escapeILike('user_name')).toBe('user\\_name');
  });

  it('should escape \\ character', () => {
    expect(escapeILike('path\\to')).toBe('path\\\\to');
  });

  it('should return unchanged string with no special chars', () => {
    expect(escapeILike('hello world')).toBe('hello world');
  });

  it('should handle mixed special characters', () => {
    expect(escapeILike('50% off_sale\\today')).toBe(
      '50\\% off\\_sale\\\\today',
    );
  });

  it('should handle empty string', () => {
    expect(escapeILike('')).toBe('');
  });
});
