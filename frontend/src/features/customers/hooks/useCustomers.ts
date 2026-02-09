'use client';

import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { fetchCustomers } from '@/features/customers/api';
import { customerKeys } from '@/features/customers/keys';
import type { Customer, CustomerQuery } from '@/features/customers/types';

export function useCustomers(params: CustomerQuery) {
  return usePaginatedQuery<Customer, CustomerQuery>({
    queryKey: customerKeys.list,
    queryFn: fetchCustomers,
    params,
  });
}
