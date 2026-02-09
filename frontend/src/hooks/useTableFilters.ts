'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface UseTableFiltersConfig<TSortColumn extends string> {
  defaultPage?: number;
  defaultSortBy: TSortColumn;
  defaultSortOrder: 'ASC' | 'DESC';
  dateAutofillDelay?: number;
  ascDefaultColumns?: TSortColumn[];
}

export interface TableFiltersState<
  TSortColumn extends string,
  TSortOrder extends string,
> {
  page: number;
  search: string;
  debouncedSearch: string;
  sortBy: TSortColumn;
  sortOrder: TSortOrder;
  dateFrom: string;
  dateTo: string;
  hasActiveFilters: boolean;
  handleSearchChange: (value: string) => void;
  handleDateChange: (field: 'from' | 'to', value: string) => void;
  clearDateFilters: () => void;
  handleSort: (column: TSortColumn) => void;
  handlePageChange: (newPage: number) => void;
  clearAllFilters: () => void;
}

export function useTableFilters<
  TSortColumn extends string,
  TSortOrder extends string = 'ASC' | 'DESC',
>(
  clearSelection: () => void,
  config: UseTableFiltersConfig<TSortColumn>,
): TableFiltersState<TSortColumn, TSortOrder> {
  const {
    defaultPage = 1,
    defaultSortBy,
    defaultSortOrder,
    dateAutofillDelay = 1500,
    ascDefaultColumns = [],
  } = config;

  const ascColumnsRef = useRef(ascDefaultColumns);

  const [page, setPage] = useState(defaultPage);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [sortBy, setSortBy] = useState<TSortColumn>(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>(defaultSortOrder);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (!dateFrom || dateTo) return;

    const timer = setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      setDateTo(today);
    }, dateAutofillDelay);

    return () => clearTimeout(timer);
  }, [dateFrom, dateTo, dateAutofillDelay]);

  const hasActiveFilters = !!(search || dateFrom || dateTo);

  const resetPageAndSelection = useCallback(() => {
    setPage(defaultPage);
    clearSelection();
  }, [clearSelection, defaultPage]);

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
    (column: TSortColumn) => {
      if (sortBy === column) {
        setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
      } else {
        setSortBy(column);
        setSortOrder(
          ascColumnsRef.current.includes(column) ? 'ASC' : 'DESC',
        );
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
    setSortBy(defaultSortBy);
    setSortOrder(defaultSortOrder);
    resetPageAndSelection();
  }, [resetPageAndSelection, defaultSortBy, defaultSortOrder]);

  return {
    page,
    search,
    debouncedSearch,
    sortBy,
    sortOrder: sortOrder as TSortOrder,
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
