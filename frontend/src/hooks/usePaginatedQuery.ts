'use client';

import {
  useQuery,
  keepPreviousData,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useAdminMode } from '@/context/AdminContext';
import type { PaginatedResponse } from '@/types/api';

interface UsePaginatedQueryOptions<TData, TQuery> {
  queryKey: (params: TQuery & { isInternal: boolean }) => readonly unknown[];
  queryFn: (params: TQuery, isInternal: boolean) => Promise<PaginatedResponse<TData>>;
  params: TQuery;
}

export function usePaginatedQuery<TData, TQuery>(
  options: UsePaginatedQueryOptions<TData, TQuery>,
): UseQueryResult<PaginatedResponse<TData>> {
  const { isInternal } = useAdminMode();

  return useQuery({
    queryKey: options.queryKey({ ...options.params, isInternal }),
    queryFn: () => options.queryFn(options.params, isInternal),
    placeholderData: keepPreviousData,
  });
}
