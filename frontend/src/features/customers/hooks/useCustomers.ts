'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAdminMode } from '@/context/AdminContext';
import { fetchCustomers } from '@/features/customers/api';
import { customerKeys } from '@/features/customers/keys';
import type { CustomerQuery } from '@/features/customers/types';

export function useCustomers(params: CustomerQuery) {
  const { isInternal } = useAdminMode();

  return useQuery({
    queryKey: customerKeys.list({ ...params, isInternal }),
    queryFn: () => fetchCustomers(params, isInternal),
    placeholderData: keepPreviousData,
  });
}
