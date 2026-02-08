export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  national_id?: string | null;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type SortColumn = 'created_at' | 'full_name';
export type SortOrder = 'ASC' | 'DESC';

export interface BulkDeleteResponse {
  ids: string[];
  deletedCount: number;
}

export interface CustomerQuery {
  page?: number;
  limit?: number;
  q?: string;
  sort_by?: SortColumn;
  sort_order?: SortOrder;
  date_from?: string;
  date_to?: string;
}
