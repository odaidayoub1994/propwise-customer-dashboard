import fetcher from '@/lib/fetcher';
import type {
  BulkDeleteResponse,
  Customer,
  CustomerQuery,
  PaginatedResponse,
} from '@/features/customers/types';

function internalHeaders(isInternal: boolean) {
  return isInternal ? { 'x-internal': 'true' } : {};
}

export async function fetchCustomers(
  params: CustomerQuery,
  isInternal: boolean,
): Promise<PaginatedResponse<Customer>> {
  const { data } = await fetcher.get<PaginatedResponse<Customer>>(
    '/customers',
    {
      params,
      headers: internalHeaders(isInternal),
    },
  );
  return data;
}

export async function fetchCustomer(
  id: string,
  isInternal: boolean,
): Promise<Customer> {
  const { data } = await fetcher.get<Customer>(`/customers/${id}`, {
    headers: internalHeaders(isInternal),
  });
  return data;
}

export async function createCustomer(
  body: Partial<Customer>,
  isInternal: boolean,
): Promise<Customer> {
  const { data } = await fetcher.post<Customer>('/customers', body, {
    headers: internalHeaders(isInternal),
  });
  return data;
}

export async function updateCustomer(
  id: string,
  body: Partial<Customer>,
  isInternal: boolean,
): Promise<Customer> {
  const { data } = await fetcher.put<Customer>(`/customers/${id}`, body, {
    headers: internalHeaders(isInternal),
  });
  return data;
}

export async function deleteCustomer(id: string): Promise<{ id: string }> {
  const { data } = await fetcher.delete<{ id: string }>(`/customers/${id}`);
  return data;
}

export async function bulkDeleteCustomers(
  ids: string[],
): Promise<BulkDeleteResponse> {
  const { data } = await fetcher.delete<BulkDeleteResponse>('/customers', {
    data: { ids },
  });
  return data;
}
