import { isInternalRequest } from './is-internal-request';

describe('isInternalRequest', () => {
  it('should return true for "true"', () => {
    expect(isInternalRequest('true')).toBe(true);
  });

  it('should return true for "True"', () => {
    expect(isInternalRequest('True')).toBe(true);
  });

  it('should return true for "TRUE"', () => {
    expect(isInternalRequest('TRUE')).toBe(true);
  });

  it('should return false for "false"', () => {
    expect(isInternalRequest('false')).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isInternalRequest(undefined)).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isInternalRequest('')).toBe(false);
  });
});
