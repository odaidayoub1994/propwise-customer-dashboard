'use client';

import {
  useTableFilters,
  type TableFiltersState,
} from '@/hooks/useTableFilters';
import {
  DATE_AUTOFILL_DELAY,
  DEFAULT_PAGE,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
} from '@/features/customers/constants';
import type { SortColumn, SortOrder } from '@/features/customers/types';

export type CustomerFiltersState = TableFiltersState<SortColumn, SortOrder>;

export function useCustomerFilters(
  clearSelection: () => void,
): CustomerFiltersState {
  return useTableFilters<SortColumn, SortOrder>(clearSelection, {
    defaultPage: DEFAULT_PAGE,
    defaultSortBy: DEFAULT_SORT_BY,
    defaultSortOrder: DEFAULT_SORT_ORDER,
    dateAutofillDelay: DATE_AUTOFILL_DELAY,
    ascDefaultColumns: ['full_name'],
  });
}
