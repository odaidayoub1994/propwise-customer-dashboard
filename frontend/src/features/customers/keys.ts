import type { CustomerQuery } from '@/features/customers/types';

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params: CustomerQuery & { isInternal: boolean }) =>
    [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string, isInternal: boolean) =>
    [...customerKeys.details(), id, { isInternal }] as const,
};
