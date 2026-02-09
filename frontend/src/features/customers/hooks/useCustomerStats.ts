import { useQuery } from '@tanstack/react-query';
import { fetchCustomers } from '@/features/customers/api';
import { customerKeys } from '@/features/customers/keys';

function startOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return monday.toISOString().slice(0, 10);
}

function startOfMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export function useCustomerStats(total: number | undefined) {
  const weekStart = startOfWeek();
  const monthStart = startOfMonth();

  const weekQuery = useQuery({
    queryKey: customerKeys.list({
      page: 1,
      limit: 1,
      date_from: weekStart,
      isInternal: false,
    }),
    queryFn: () =>
      fetchCustomers({ page: 1, limit: 1, date_from: weekStart }, false),
    staleTime: 60_000,
  });

  const monthQuery = useQuery({
    queryKey: customerKeys.list({
      page: 1,
      limit: 1,
      date_from: monthStart,
      isInternal: false,
    }),
    queryFn: () =>
      fetchCustomers({ page: 1, limit: 1, date_from: monthStart }, false),
    staleTime: 60_000,
  });

  return {
    total: total ?? 0,
    thisWeek: weekQuery.data?.meta.total ?? 0,
    thisMonth: monthQuery.data?.meta.total ?? 0,
    isLoading: weekQuery.isLoading || monthQuery.isLoading,
  };
}
