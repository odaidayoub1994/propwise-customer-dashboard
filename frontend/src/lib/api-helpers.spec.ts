import { internalHeaders } from './api-helpers';

describe('internalHeaders', () => {
  it('returns x-internal header when isInternal is true', () => {
    expect(internalHeaders(true)).toEqual({ 'x-internal': 'true' });
  });

  it('returns empty object when isInternal is false', () => {
    expect(internalHeaders(false)).toEqual({});
  });

  it('returns a plain Record<string, string>', () => {
    const result = internalHeaders(true);
    expect(typeof result['x-internal']).toBe('string');
  });
});
