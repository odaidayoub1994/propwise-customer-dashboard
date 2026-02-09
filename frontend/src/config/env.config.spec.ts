import { API_URL } from './env.config';

describe('env.config', () => {
  it('API_URL defaults to http://localhost:4000', () => {
    expect(API_URL).toBe('http://localhost:4000');
  });
});
