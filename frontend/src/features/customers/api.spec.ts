import { vi, type Mock } from 'vitest';
import fetcher from '@/lib/fetcher';
import {
  fetchCustomers,
  fetchCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  bulkDeleteCustomers,
} from './api';
import { mockCustomer, mockPaginatedResponse } from '@/test/fixtures';

vi.mock('@/lib/fetcher', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

afterEach(() => vi.clearAllMocks());

describe('customers API', () => {
  it('fetchCustomers sends params and internal header', async () => {
    (fetcher.get as Mock).mockResolvedValue({ data: mockPaginatedResponse });
    const result = await fetchCustomers({ page: 1, limit: 20 }, true);

    expect(fetcher.get).toHaveBeenCalledWith('/customers', {
      params: { page: 1, limit: 20 },
      headers: { 'x-internal': 'true' },
    });
    expect(result).toEqual(mockPaginatedResponse);
  });

  it('fetchCustomers sends empty headers for public mode', async () => {
    (fetcher.get as Mock).mockResolvedValue({ data: mockPaginatedResponse });
    await fetchCustomers({ page: 1 }, false);

    expect(fetcher.get).toHaveBeenCalledWith('/customers', {
      params: { page: 1 },
      headers: {},
    });
  });

  it('fetchCustomer calls GET /customers/:id with headers', async () => {
    (fetcher.get as Mock).mockResolvedValue({ data: mockCustomer });
    const result = await fetchCustomer('abc', true);

    expect(fetcher.get).toHaveBeenCalledWith('/customers/abc', {
      headers: { 'x-internal': 'true' },
    });
    expect(result).toEqual(mockCustomer);
  });

  it('createCustomer calls POST /customers with body and headers', async () => {
    const body = { full_name: 'Jane', email: 'jane@example.com' };
    (fetcher.post as Mock).mockResolvedValue({ data: mockCustomer });
    const result = await createCustomer(body, true);

    expect(fetcher.post).toHaveBeenCalledWith('/customers', body, {
      headers: { 'x-internal': 'true' },
    });
    expect(result).toEqual(mockCustomer);
  });

  it('updateCustomer calls PUT /customers/:id with body and headers', async () => {
    const body = { full_name: 'Updated' };
    (fetcher.put as Mock).mockResolvedValue({ data: mockCustomer });
    const result = await updateCustomer('abc', body, false);

    expect(fetcher.put).toHaveBeenCalledWith('/customers/abc', body, {
      headers: {},
    });
    expect(result).toEqual(mockCustomer);
  });

  it('deleteCustomer calls DELETE /customers/:id', async () => {
    (fetcher.delete as Mock).mockResolvedValue({ data: { id: 'abc' } });
    const result = await deleteCustomer('abc');

    expect(fetcher.delete).toHaveBeenCalledWith('/customers/abc');
    expect(result).toEqual({ id: 'abc' });
  });

  it('bulkDeleteCustomers calls DELETE /customers with ids in body', async () => {
    const response = { ids: ['a', 'b'], deletedCount: 2 };
    (fetcher.delete as Mock).mockResolvedValue({ data: response });
    const result = await bulkDeleteCustomers(['a', 'b']);

    expect(fetcher.delete).toHaveBeenCalledWith('/customers', {
      data: { ids: ['a', 'b'] },
    });
    expect(result).toEqual(response);
  });

  it('returns response.data, not the full Axios response', async () => {
    (fetcher.get as Mock).mockResolvedValue({
      data: mockCustomer,
      status: 200,
      headers: {},
    });
    const result = await fetchCustomer('abc', false);
    expect(result).toEqual(mockCustomer);
    expect(result).not.toHaveProperty('status');
  });
});
