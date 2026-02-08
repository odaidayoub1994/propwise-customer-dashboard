'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  DATE_AUTOFILL_DELAY,
  DEFAULT_PAGE,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
} from '@/features/customers/constants';
import type { SortColumn, SortOrder } from '@/features/customers/types';

export interface CustomerFiltersState {
  page: number;
  search: string;
  debouncedSearch: string;
  sortBy: SortColumn;
  sortOrder: SortOrder;
  dateFrom: string;
  dateTo: string;
  hasActiveFilters: boolean;
  handleSearchChange: (value: string) => void;
  handleDateChange: (field: 'from' | 'to', value: string) => void;
  clearDateFilters: () => void;
  handleSort: (column: SortColumn) => void;
  handlePageChange: (newPage: number) => void;
  clearAllFilters: () => void;
}

export function useCustomerFilters(
  clearSelection: () => void,
): CustomerFiltersState {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [sortBy, setSortBy] = useState<SortColumn>(DEFAULT_SORT_BY);
  const [sortOrder, setSortOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (!dateFrom || dateTo) return;

    const timer = setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      setDateTo(today);
    }, DATE_AUTOFILL_DELAY);

    return () => clearTimeout(timer);
  }, [dateFrom, dateTo]);

  const hasActiveFilters = !!(search || dateFrom || dateTo);

  const resetPageAndSelection = useCallback(() => {
    setPage(DEFAULT_PAGE);
    clearSelection();
  }, [clearSelection]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      resetPageAndSelection();
    },
    [resetPageAndSelection],
  );

  const handleDateChange = useCallback(
    (field: 'from' | 'to', value: string) => {
      if (field === 'from') setDateFrom(value);
      else setDateTo(value);
      resetPageAndSelection();
    },
    [resetPageAndSelection],
  );

  const clearDateFilters = useCallback(() => {
    setDateFrom('');
    setDateTo('');
    resetPageAndSelection();
  }, [resetPageAndSelection]);

  const handleSort = useCallback(
    (column: SortColumn) => {
      if (sortBy === column) {
        setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
      } else {
        setSortBy(column);
        setSortOrder(column === 'full_name' ? 'ASC' : 'DESC');
      }
      resetPageAndSelection();
    },
    [sortBy, resetPageAndSelection],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      clearSelection();
    },
    [clearSelection],
  );

  const clearAllFilters = useCallback(() => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setSortBy(DEFAULT_SORT_BY);
    setSortOrder(DEFAULT_SORT_ORDER);
    resetPageAndSelection();
  }, [resetPageAndSelection]);

  return {
    page,
    search,
    debouncedSearch,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
    hasActiveFilters,
    handleSearchChange,
    handleDateChange,
    clearDateFilters,
    handleSort,
    handlePageChange,
    clearAllFilters,
  };
}
