import type { CustomerQuery, SortColumn, SortOrder } from './types';

export const DEFAULT_SORT_BY: SortColumn = 'created_at';
export const DEFAULT_SORT_ORDER: SortOrder = 'DESC';
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MIN_SEARCH_LENGTH = 3;

export const DEFAULT_QUERY = {
  page: DEFAULT_PAGE,
  limit: DEFAULT_LIMIT,
  sort_by: DEFAULT_SORT_BY,
  sort_order: DEFAULT_SORT_ORDER,
} satisfies CustomerQuery;
