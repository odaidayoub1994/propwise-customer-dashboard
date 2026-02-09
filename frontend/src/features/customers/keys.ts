import { createEntityKeys } from '@/lib/query-keys';
import type { CustomerQuery } from '@/features/customers/types';

export const customerKeys = createEntityKeys<CustomerQuery>('customers');
