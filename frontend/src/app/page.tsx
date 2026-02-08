import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/react-query';
import { fetchCustomers } from '@/features/customers/api';
import { customerKeys } from '@/features/customers/keys';
import { DEFAULT_QUERY } from '@/features/customers/constants';
import { CustomerTable } from '@/features/customers/components/CustomerTable';

export default async function HomePage() {
  const queryClient: QueryClient = makeQueryClient();

  await queryClient.prefetchQuery({
    queryKey: customerKeys.list({
      ...DEFAULT_QUERY,
      isInternal: false,
    }),
    queryFn: () => fetchCustomers(DEFAULT_QUERY, false),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CustomerTable />
    </HydrationBoundary>
  );
}
