'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminMode } from '@/context/AdminContext';
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  bulkDeleteCustomers,
} from '@/features/customers/api';
import { customerKeys } from '@/features/customers/keys';
import type { Customer } from '@/features/customers/types';

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { isInternal } = useAdminMode();

  return useMutation({
    mutationFn: (data: Partial<Customer>) => createCustomer(data, isInternal),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const { isInternal } = useAdminMode();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      updateCustomer(id, data, isInternal),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  });
}

export function useBulkDeleteCustomers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteCustomers(ids),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  });
}
