import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/react-query';
import { fetchCustomers } from '@/features/customers/api';
import { customerKeys } from '@/features/customers/keys';
import { CustomerTable } from '@/features/customers/components/CustomerTable';

export default async function HomePage() {
  const queryClient: QueryClient = makeQueryClient();

  await queryClient.prefetchQuery({
    queryKey: customerKeys.list({
      page: 1,
      limit: 20,
      sort_by: 'created_at',
      sort_order: 'DESC',
      isInternal: false,
    }),
    queryFn: () =>
      fetchCustomers(
        { page: 1, limit: 20, sort_by: 'created_at', sort_order: 'DESC' },
        false,
      ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CustomerTable />
    </HydrationBoundary>
  );
}
