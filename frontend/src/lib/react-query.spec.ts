import { QueryClient } from '@tanstack/react-query';
import { makeQueryClient } from './react-query';

describe('makeQueryClient', () => {
  it('returns a QueryClient instance', () => {
    const client = makeQueryClient();
    expect(client).toBeInstanceOf(QueryClient);
  });

  it('sets staleTime to 30 seconds', () => {
    const client = makeQueryClient();
    expect(client.getDefaultOptions().queries?.staleTime).toBe(30_000);
  });
});
